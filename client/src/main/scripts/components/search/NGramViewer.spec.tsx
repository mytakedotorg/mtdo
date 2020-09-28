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
import React from "react";
import renderer from "react-test-renderer";
import { Foundation } from "../../common/foundation";
import NGramViewer, { _getSearchTerms } from "./NGramViewer";
import { SearchMode, _searchImpl, _SearchWithData } from "./search";
// this is created by LucenePlayground
import socialSecuritySearchResults from "./testData/socialSecuritySearchResults.json";

test("NGramViewer parses search terms", () => {
  const searchQueries = [
    "Wall, -Wall Street",
    "global warming, climate change",
  ];
  const expectedTerms = [["wall"], ["global warming", "climate change"]];

  searchQueries.forEach((q, idx) => {
    const terms = _getSearchTerms(q);
    expect(terms).toEqual(expectedTerms[idx]);
  });
});

test("NGramViewer social security", async () => {
  const result = _searchImpl(
    new _SearchWithData(
      "social security",
      socialSecuritySearchResults.facts,
      await Foundation.fetchAll(
        socialSecuritySearchResults.facts.map((f) => f.hash)
      ),
      SearchMode.BeforeAndAfter
    )
  );

  const tree = renderer
    .create(<NGramViewer searchResult={result} onBarClick={jest.fn()} />)
    .toJSON();

  expect(tree).toMatchSnapshot();
});
