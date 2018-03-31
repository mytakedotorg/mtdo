/*
 * MyTake.org
 *
 *  Copyright 2017 by its authors.
 *  Some rights reserved. See LICENSE, https://github.com/mytakedotorg/mytakedotorg/graphs/contributors
 */
package common;

import com.diffplug.common.base.Errors;
import com.diffplug.common.base.Throwing;
import com.google.common.collect.ImmutableSet;
import compat.java2ts.VideoFactContentJava;
import java.io.IOException;
import java.io.Reader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java2ts.Search;
import java2ts.Search.FactResultList;
import java2ts.Search.VideoResult;
import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.CharArraySet;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.StopFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.analysis.standard.StandardFilter;
import org.apache.lucene.analysis.standard.StandardTokenizer;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field.Store;
import org.apache.lucene.document.LongPoint;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.index.Term;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.BooleanClause.Occur;
import org.apache.lucene.search.BooleanQuery;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.RAMDirectory;

public class Lucene implements AutoCloseable {
	private final Directory directory;
	private final MyTakeDotOrgAnalyzer analyzer;
	private final DirectoryReader reader;
	private final IndexSearcher searcher;

	public Lucene(Throwing.Specific.Consumer<IndexWriter, IOException> populate) throws IOException {
		analyzer = new MyTakeDotOrgAnalyzer();

		// Store the index in memory:
		directory = new RAMDirectory();
		// To store an index on disk, use this instead:
		//Directory directory = FSDirectory.open("/tmp/testindex");
		IndexWriterConfig config = new IndexWriterConfig(analyzer);
		try (IndexWriter iwriter = new IndexWriter(directory, config)) {
			populate.accept(iwriter);
		}

		// Now search the index:
		reader = DirectoryReader.open(directory);
		searcher = new IndexSearcher(reader);
	}

	@Override
	public void close() throws IOException {
		reader.close();
		directory.close();
		analyzer.close();
	}

	static class NextRequest {
		Search.Request request;
		List<String> people;
	}

	public FactResultList searchDebate(Search.Request request) throws IOException {
		NextRequest next = new NextRequest();
		next.request = request;
		next.people = Collections.emptyList();
		return searchDebate(next);
	}

	FactResultList searchDebate(NextRequest request) throws IOException {
		QueryParser parser = new QueryParser(CONTENT, analyzer);
		Query phraseQuery = parser.createPhraseQuery(CONTENT, request.request.q);

		BooleanQuery.Builder finalQuery = new BooleanQuery.Builder();
		finalQuery.add(phraseQuery, Occur.MUST);
		if (!request.people.isEmpty()) {
			BooleanQuery.Builder speakerQuery = new BooleanQuery.Builder();
			for (String person : request.people) {
				speakerQuery.add(new TermQuery(new Term(SPEAKER, person)), Occur.SHOULD);
			}
			finalQuery.add(speakerQuery.build(), Occur.MUST);
		}
		List<Document> queryResults = runQuery(finalQuery.build());

		FactResultList resultList = new FactResultList();
		resultList.facts = new ArrayList<>(queryResults.size());
		for (int i = 0; i < queryResults.size(); ++i) {
			Document document = queryResults.get(i);
			VideoResult result = new VideoResult();
			result.hash = document.get(HASH);
			result.turn = Integer.parseInt(document.get(TURN));
			resultList.facts.add(result);
		}
		return resultList;
	}

	private static final int MAX_RESULTS = 100;

	private List<Document> runQuery(Query query) throws IOException {
		TopDocs topDocs = searcher.search(query, MAX_RESULTS);
		List<Document> docs = new ArrayList<>();
		for (ScoreDoc scoreDoc : topDocs.scoreDocs) {
			docs.add(searcher.doc(scoreDoc.doc, TO_FETCH));
		}
		return docs;
	}

	private static final String HASH = "hash";
	private static final String TURN = "turn";
	private static final String DATE = "date";
	private static final String SPEAKER = "speaker";
	private static final String CONTENT = "content";

	private static final ImmutableSet<String> TO_FETCH = ImmutableSet.of(HASH, TURN);

	public static Lucene forFacts() throws IOException {
		return new Lucene(Lucene::forFactsInit);
	}

	private static void forFactsInit(IndexWriter writer) throws IOException {
		FoundationLoad.perVideo((hash, video) -> writeVideo(writer, hash, video));
	}

	static void writeVideo(IndexWriter writer, String hash, VideoFactContentJava videoFact) {
		int end = videoFact.plainText.length();
		for (int i = videoFact.speakerWord.length - 1; i >= 0; --i) {
			Document doc = new Document();
			// stored but not indexed
			doc.add(new StoredField(HASH, hash));
			doc.add(new StoredField(TURN, i));

			// indexed but not stored
			String speaker = videoFact.speakers.get(videoFact.speakerPerson[i]).fullName;
			doc.add(new StringField(SPEAKER, speaker, Store.NO));
			doc.add(new LongPoint(DATE, FoundationLoad.parseDate(videoFact.fact.primaryDate)));

			// the text that we're indexing (not stored)
			int start = videoFact.charOffsets[videoFact.speakerWord[i]];
			String sub = videoFact.plainText.substring(start, end);
			doc.add(new TextField(CONTENT, sub, Store.NO));

			// write it and get ready for the next one
			Errors.rethrow().run(() -> writer.addDocument(doc));
			end = start - 1;
		}
	}

	private static class MyTakeDotOrgAnalyzer extends Analyzer {
		private static final int MAX_TOKEN_LENGTH = 127;
		private static final CharArraySet STOPWORDS;

		static {
			boolean ignoreCase = true;
			STOPWORDS = new CharArraySet(StandardAnalyzer.ENGLISH_STOP_WORDS_SET, ignoreCase);
			STOPWORDS.add("uh");
			STOPWORDS.add("eh");
		}

		@Override
		protected TokenStreamComponents createComponents(final String fieldName) {
			final StandardTokenizer src = new StandardTokenizer();
			src.setMaxTokenLength(MAX_TOKEN_LENGTH);
			TokenStream tok = new StandardFilter(src);
			tok = new LowerCaseFilter(tok);
			tok = new StopFilter(tok, STOPWORDS);
			return new TokenStreamComponents(src, tok) {
				@Override
				protected void setReader(final Reader reader) {
					// So that if maxTokenLength was changed, the change takes
					// effect next time tokenStream is called:
					src.setMaxTokenLength(MAX_TOKEN_LENGTH);
					super.setReader(reader);
				}
			};
		}

		@Override
		protected TokenStream normalize(String fieldName, TokenStream in) {
			TokenStream result = new StandardFilter(in);
			result = new LowerCaseFilter(result);
			return result;
		}
	}
}
