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
import {
  Bookmark,
  BookmarksClient,
  BookmarksMode,
  BookmarksResult,
  bookmarkToIntermediate,
  getBookmarks,
} from "./bookmarks";
import BookmarksList from "./BookmarksList";

interface BookmarksLoaderProps {}

interface BookmarksLoaderState {
  bookmarksResult?: BookmarksResult;
}

const BookmarksLoader: React.FC<BookmarksLoaderProps> = (props) => {
  const [state, setState] = useState<BookmarksLoaderState>({});
  const [mode, setMode] = useState<BookmarksMode>(BookmarksMode.DateBookmarked);
  // TODO rename this variable to be more semantic
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const handleModeChange = (newMode: BookmarksMode) => {
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
    async function connect() {
      const bookmarksResult = await getBookmarks(mode);
      setState({
        bookmarksResult,
      });
      setBookmarks(
        bookmarksResult.factHits.flatMap((fh) =>
          fh.bookmarkHits.map((bh) => bh.bookmark)
        )
      );
    }

    connect();
  }, [mode]);

  return state.bookmarksResult ? (
    <BookmarksList
      mode={mode}
      bookmarks={bookmarks}
      bookmarksResult={state.bookmarksResult}
      eventHandlers={{
        onAddBookmark: handleAddBookmark,
        onRemoveBookmark: handleRemoveBookmark,
        onModeChange: handleModeChange,
      }}
    />
  ) : (
    <BookmarksLoadingView />
  );
};

const BookmarksLoadingView: React.FC = () => (
  <div className="bookmarks">
    <div className="bookmarks__inner-container">
      <h2 className="bookmarks__heading">Loading...</h2>
    </div>
  </div>
);

export default BookmarksLoader;
