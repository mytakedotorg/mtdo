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
import isEqual from "lodash/isEqual";
import React, { useEffect, useState } from "react";
import {
  Bookmark,
  BookmarksClient,
  BookmarksMode,
  BookmarksResult,
  bookmarkToIntermediate,
  getBookmarks,
  isBookmarkEqualToSocial,
} from "./bookmarks";
import BookmarksList from "./BookmarksList";

interface BookmarksLoaderProps {}

const BookmarksLoader: React.FC<BookmarksLoaderProps> = (props) => {
  const [result, setResult] = useState<BookmarksResult | undefined>(undefined);
  const [mode, setMode] = useState<BookmarksMode>(BookmarksMode.DateBookmarked);
  const [bookmarksToRemove, setBookmarksToRemove] = useState<Bookmark[]>([]);

  const handleModeChange = (newMode: BookmarksMode) => {
    if (newMode !== mode) {
      setMode(newMode);
    }
  };

  const handleUndoRemoveBookmark = (newBookmark: Bookmark) => {
    setBookmarksToRemove((existingBookmarks) => {
      return existingBookmarks.filter((eb) => !isEqual(eb, newBookmark));
    });
  };

  const handleRemoveSingleBookmark = (oldBookmark: Bookmark) => {
    setBookmarksToRemove((existingBookmarks) => {
      return [...existingBookmarks, oldBookmark];
    });
  };

  const handleConfirmRemoval = () => {
    setResult(
      (prevResult) =>
        new BookmarksResult(
          prevResult!.factHits.map((fh) => ({
            hash: fh.hash,
            bookmarkHits: fh.bookmarkHits.filter(
              (bh) =>
                !bookmarksToRemove.find((b) =>
                  isBookmarkEqualToSocial(bh.bookmark, b.content)
                )
            ),
          }))
        )
    );
    setBookmarksToRemove([]);
    BookmarksClient.getInstance().remove(
      bookmarksToRemove.map((b) => bookmarkToIntermediate(b))
    );
  };

  useEffect(() => {
    async function connect() {
      const bookmarksResult = await getBookmarks(mode);
      setResult(bookmarksResult);
    }
    connect();
  }, [mode]);

  return result ? (
    <BookmarksList
      mode={mode}
      bookmarksToRemove={bookmarksToRemove}
      bookmarksResult={result}
      eventHandlers={{
        onUndoRemoveBookmark: handleUndoRemoveBookmark,
        onConfirmRemoval: handleConfirmRemoval,
        onRemoveBookmark: handleRemoveSingleBookmark,
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
