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
import {
  SearchMode,
  SearchResult,
  _searchImpl,
  _SearchWithData,
} from "./search";
import SearchContainer, {
  SearchContainerEventHandlers,
} from "./SearchContainer";
// this data is generated by server/src/test/java/controllers/LucenePlayground.java
import socialSecuritySearchResults from "./testData/socialSecuritySearchResults.json";
import wallSearchResults from "./testData/wallSearchResults.json";
import { VideoResultsListProps } from "./VideoResultsList";

jest.mock("../SearchBar", () => ({
  __esModule: true,
  default: "Searchbar",
}));

jest.mock("./NGramViewer", () => ({
  __esModule: true,
  default: (props: SearchResult) => {
    return <div>NGramViewer: {props.searchQuery}</div>;
  },
}));

jest.mock("../VideoLite", () => ({
  __esModule: true,
  default: "VideoLite",
}));

jest.mock("./SearchRadioButtons", () => ({
  __esModule: true,
  default: "SearchRadioButtons",
}));

jest.mock("./VideoResultsList", () => ({
  __esModule: true,
  default: (props: VideoResultsListProps) => {
    const { searchResult } = props;
    return (
      <div>
        VideoResultsList: {searchResult.factHits.length} hits for{" "}
        {searchResult.searchQuery}
      </div>
    );
  },
}));

const eventHandlers: SearchContainerEventHandlers = {
  onModeChange: jest.fn(),
  onAddBookmark: jest.fn(),
  onRemoveBookmark: jest.fn(),
};

test("SearchContainer social security", async (done) => {
  const result = _searchImpl(
    new _SearchWithData(
      "social security",
      socialSecuritySearchResults.facts,
      await Foundation.fetchAll(
        socialSecuritySearchResults.facts.map((fact) => fact.hash)
      ),
      SearchMode.BeforeAndAfter
    )
  );

  const tree = renderer
    .create(
      <SearchContainer
        bookmarks={[]}
        mode={SearchMode.Containing}
        eventHandlers={eventHandlers}
        searchResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
  done();
});

test("SearchContainer social security before and after", async (done) => {
  const result = _searchImpl(
    new _SearchWithData(
      "social security",
      socialSecuritySearchResults.facts,
      await Foundation.fetchAll(
        socialSecuritySearchResults.facts.map((fact) => fact.hash)
      ),
      SearchMode.BeforeAndAfter
    )
  );

  const tree = renderer
    .create(
      <SearchContainer
        bookmarks={[]}
        mode={SearchMode.BeforeAndAfter}
        eventHandlers={eventHandlers}
        searchResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
  done();
});

test("SearchContainer no results", async (done) => {
  const result = _searchImpl(
    new _SearchWithData(
      "gibberish",
      [],
      await Foundation.fetchAll([]),
      SearchMode.BeforeAndAfter
    )
  );
  const tree = renderer
    .create(
      <SearchContainer
        bookmarks={[]}
        mode={SearchMode.Containing}
        eventHandlers={eventHandlers}
        searchResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
  done();
});

test("SearchContainer wall, -wall street", async (done) => {
  const result = _searchImpl(
    new _SearchWithData(
      "wall, -wall street",
      wallSearchResults.facts,
      await Foundation.fetchAll(
        wallSearchResults.facts.map((fact) => fact.hash)
      ),
      SearchMode.BeforeAndAfter
    )
  );

  const tree = renderer
    .create(
      <SearchContainer
        bookmarks={[]}
        mode={SearchMode.Containing}
        eventHandlers={eventHandlers}
        searchResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
  done();
});
