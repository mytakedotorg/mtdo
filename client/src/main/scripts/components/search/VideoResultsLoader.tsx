/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { isLoggedIn } from "../../browser";
import {
  Bookmark,
  BookmarksClient,
  bookmarkToIntermediate,
} from "../bookmarks/bookmarks";
import { search, SearchMode, SearchResult } from "./search";
import SearchContainer from "./SearchContainer";

interface VideoResultsLoaderProps {
  searchQuery: string;
}

const VideoResultsLoader: React.FC<VideoResultsLoaderProps> = (props) => {
  const [searchResult, setSearchResult] = useState<SearchResult | undefined>();
  const [mode, setMode] = useState<SearchMode>(SearchMode.BeforeAndAfter);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const handleModeChange = (newMode: SearchMode) => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  };

  const handleAddBookmark = (newBookmark: Bookmark) => {
    setBookmarks((existingBookmarks) => {
      return [...existingBookmarks, newBookmark];
    });
    try {
      BookmarksClient.getInstance().add([bookmarkToIntermediate(newBookmark)]);
    } catch (err: unknown) {
      setBookmarks((existingBookmarks) => {
        return existingBookmarks.filter((eb) => !_.isEqual(eb, newBookmark));
      });
      throw err;
    }
  };

  const handleRemoveBookmark = (oldBookmark: Bookmark) => {
    setBookmarks((existingBookmarks) => {
      return existingBookmarks.filter((eb) => !_.isEqual(eb, oldBookmark));
    });
    try {
      BookmarksClient.getInstance().remove([
        bookmarkToIntermediate(oldBookmark),
      ]);
    } catch (err: unknown) {
      setBookmarks((existingBookmarks) => {
        return [...existingBookmarks, oldBookmark];
      });
      throw err;
    }
  };

  useEffect(() => {
    async function connectSearchDatabase() {
      const searchResult = await search(props.searchQuery, mode);
      setSearchResult(searchResult);
    }

    connectSearchDatabase();
  }, [mode]);

  useEffect(() => {
    async function loadBookmarks() {
      const bookmarks = await BookmarksClient.getInstance().get();
      setBookmarks(bookmarks);
    }

    if (isLoggedIn()) {
      loadBookmarks();
    }
  }, []);

  useEffect(() => {
    console.log(bookmarks);
  }, [bookmarks]);

  return searchResult ? (
    <SearchContainer
      bookmarks={bookmarks}
      eventHandlers={{
        onAddBookmark: handleAddBookmark,
        onRemoveBookmark: handleRemoveBookmark,
        onModeChange: handleModeChange,
      }}
      mode={mode}
      searchResult={searchResult}
    />
  ) : (
    <VideoResultLoadingView />
  );
};

const VideoResultLoadingView: React.FC = () => (
  <div className="results">
    <div className="results__inner-container">
      <h1 className="results__heading">Searching...</h1>
    </div>
  </div>
);

export default VideoResultsLoader;
