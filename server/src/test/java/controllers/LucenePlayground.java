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
package controllers;

import com.jsoniter.output.JsonStream;
import java.io.IOException;
import java2ts.Search.FactResultList;
import org.mytake.lucene.Lucene;

public class LucenePlayground {
	public static void main(String[] args) throws IOException {
		try (Lucene lucene = Lucene.openFromArchive()) {
			// this prints something to the console
			// which is used by VideoResultsList.spec.tsx
			FactResultList resultList = lucene.searchDebate("social security");
			System.out.println(JsonStream.serialize(resultList));
		}
	}
}
