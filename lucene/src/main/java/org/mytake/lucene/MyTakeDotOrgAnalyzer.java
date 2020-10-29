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
package org.mytake.lucene;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.CharArraySet;
import org.apache.lucene.analysis.LowerCaseFilter;
import org.apache.lucene.analysis.StopFilter;
import org.apache.lucene.analysis.TokenStream;
import org.apache.lucene.analysis.en.EnglishAnalyzer;
import org.apache.lucene.analysis.en.EnglishMinimalStemFilter;
import org.apache.lucene.analysis.en.EnglishPossessiveFilter;
import org.apache.lucene.analysis.standard.StandardTokenizer;

public class MyTakeDotOrgAnalyzer extends Analyzer {
	private static final int MAX_TOKEN_LENGTH = 127;
	private static final CharArraySet STOPWORDS;

	static {
		boolean ignoreCase = true;
		STOPWORDS = new CharArraySet(EnglishAnalyzer.ENGLISH_STOP_WORDS_SET, ignoreCase);
		STOPWORDS.add("uh");
		STOPWORDS.add("eh");
		STOPWORDS.add("er");
		STOPWORDS.add("erm");
	}

	@Override
	protected TokenStreamComponents createComponents(final String fieldName) {
		StandardTokenizer src = new StandardTokenizer();
		src.setMaxTokenLength(MAX_TOKEN_LENGTH);
		TokenStream tok = src;
		tok = new LowerCaseFilter(tok);
		tok = new EnglishPossessiveFilter(tok);
		tok = new EnglishMinimalStemFilter(tok);
		tok = new StopFilter(tok, STOPWORDS);
		return new TokenStreamComponents(reader -> {
			// So that if maxTokenLength was changed, the change takes
			// effect next time tokenStream is called:
			src.setMaxTokenLength(MAX_TOKEN_LENGTH);
			src.setReader(reader);
		}, tok);
	}

	@Override
	protected TokenStream normalize(String fieldName, TokenStream in) {
		return new LowerCaseFilter(in);
	}
}
