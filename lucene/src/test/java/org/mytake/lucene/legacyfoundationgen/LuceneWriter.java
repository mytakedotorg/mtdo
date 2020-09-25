/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
package org.mytake.lucene.legacyfoundationgen;

import com.diffplug.common.base.Errors;
import java.io.IOException;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.TimeZone;
import org.apache.lucene.document.Document;
import org.apache.lucene.document.Field.Store;
import org.apache.lucene.document.LongPoint;
import org.apache.lucene.document.StoredField;
import org.apache.lucene.document.StringField;
import org.apache.lucene.document.TextField;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.store.MMapDirectory;
import org.mytake.factset.video.VideoFactContentJava;
import org.mytake.lucene.Lucene;
import org.mytake.lucene.Lucene.MyTakeDotOrgAnalyzer;

public class LuceneWriter implements AutoCloseable {
	private final MyTakeDotOrgAnalyzer analyzer;
	private final MMapDirectory directory;
	private final IndexWriter iwriter;

	public LuceneWriter(Path path) throws IOException {
		analyzer = new MyTakeDotOrgAnalyzer();
		directory = new MMapDirectory(path);
		directory.setUseUnmap(true);
		IndexWriterConfig config = new IndexWriterConfig(analyzer);
		iwriter = new IndexWriter(directory, config);
	}

	public void writeVideo(String hash, VideoFactContentJava videoFact) throws IOException {
		int end = videoFact.plainText.length();
		for (int i = videoFact.turnWord.length - 1; i >= 0; --i) {
			Document doc = new Document();
			// stored but not indexed
			doc.add(new StoredField(Lucene.HASH, hash));
			doc.add(new StoredField(Lucene.TURN, i));

			// indexed but not stored
			String speaker = videoFact.speakers.get(videoFact.turnSpeaker[i]).fullName;
			doc.add(new StringField(Lucene.SPEAKER, speaker, Store.NO));
			doc.add(new LongPoint(Lucene.DATE, parseDate(videoFact.fact.primaryDate)));

			// the text that we're indexing (not stored)
			int start = videoFact.wordChar[videoFact.turnWord[i]];
			try {
				String sub = videoFact.plainText.substring(start, end);
				doc.add(new TextField(Lucene.CONTENT, sub, Store.NO));
			} catch (Exception e) {
				System.out.println("ERROR in " + videoFact.fact.title + " at:");
				System.out.println(videoFact.plainText.substring(start, Math.min(start + 200, videoFact.plainText.length())));
				throw e;
			}

			// write it and get ready for the next one
			iwriter.addDocument(doc);
			end = start - 1;
		}
	}

	@Override
	public void close() throws IOException {
		iwriter.close();
		directory.close();
		analyzer.close();
	}

	/** Turns yyyy-MM-dd into milliseconds since Jan 1 1970. */
	private static long parseDate(String yyyyMMdd) {
		SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
		format.setTimeZone(TimeZone.getTimeZone("UTC"));
		return Errors.rethrow().get(() -> format.parse(yyyyMMdd).getTime());
	}
}
