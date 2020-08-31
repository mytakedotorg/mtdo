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
import React from "react";
import { FT } from "../../java2ts/FT";
import { Bookmark, BookmarksMode, BookmarksResult } from "./bookmarks";
import BookmarksResultList from "./BookmarksResultList";
import BookmarksSortBy from "./BookmarksSortBy";

export interface BookmarksListEventHandlers {
  onModeChange(mode: BookmarksMode): void;
  onAddBookmark(bookmark: Bookmark): void;
  onRemoveBookmark(bookmark: Bookmark): void;
}

interface BookmarksListProps {
  mode: BookmarksMode;
  bookmarks: Bookmark[];
  bookmarksResult: BookmarksResult;
  eventHandlers: BookmarksListEventHandlers;
}
const BookmarksList: React.FC<BookmarksListProps> = ({
  bookmarks,
  bookmarksResult,
  eventHandlers,
  mode,
}) => {
  const handlePlayClick = (
    videoFact: FT.VideoFactContent,
    clipRange: [number, number]
  ) => {
    console.warn("TODO play the video");
  };
  return (
    <div className="results">
      {bookmarksResult.factHits.length && (
        <BookmarksSortBy
          onChange={eventHandlers.onModeChange}
          selectedOption={mode}
        />
      )}
      <div className="results__inner-container">
        <BookmarksResultList
          bookmarks={bookmarks}
          eventHandlers={{
            onAddBookmark: eventHandlers.onAddBookmark,
            onRemoveBookmark: eventHandlers.onRemoveBookmark,
            onPlayClick: handlePlayClick,
          }}
          bookmarksResult={bookmarksResult}
        />
      </div>
    </div>
  );
};

export default BookmarksList;
