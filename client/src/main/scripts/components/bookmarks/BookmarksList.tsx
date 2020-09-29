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
import { slugify } from "../../common/functions";
import { encodeSocial, Social } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import { Bookmark, BookmarksMode, BookmarksResult } from "./bookmarks";
import BookmarksResultList from "./BookmarksResultList";
import BookmarksSortBy from "./BookmarksSortBy";

export interface BookmarksListEventHandlers {
  onModeChange(mode: BookmarksMode): void;
  onUndoRemoveBookmark(bookmark: Bookmark): void;
  onConfirmRemoval(): void;
  onRemoveBookmark(bookmark: Bookmark): void;
}

interface BookmarksListProps {
  mode: BookmarksMode;
  bookmarksToRemove: Bookmark[];
  bookmarksResult: BookmarksResult;
  eventHandlers: BookmarksListEventHandlers;
}
const BookmarksList: React.FC<BookmarksListProps> = ({
  bookmarksToRemove,
  bookmarksResult,
  eventHandlers,
  mode,
}) => {
  const handlePlayClick = (videoFact: FT.VideoFactContent, social: Social) => {
    const contextUrl = `${Routes.FOUNDATION}/${slugify(
      videoFact.fact.title
    )}/${encodeSocial(social)}`;
    window.location.href = contextUrl;
  };
  return (
    <div className="results">
      <div className="results__row">
        {bookmarksResult.factHits.length > 0 && (
          <BookmarksSortBy
            onChange={eventHandlers.onModeChange}
            selectedOption={mode}
          />
        )}
        {bookmarksToRemove.length > 0 && (
          <button
            className="bookmarks__remove"
            onClick={eventHandlers.onConfirmRemoval}
          >
            Confirm Removal
          </button>
        )}
      </div>
      <BookmarksResultList
        bookmarksToRemove={bookmarksToRemove}
        eventHandlers={{
          onUndoRemoveBookmark: eventHandlers.onUndoRemoveBookmark,
          onRemoveBookmark: eventHandlers.onRemoveBookmark,
          onPlayClick: handlePlayClick,
        }}
        bookmarksResult={bookmarksResult}
      />
    </div>
  );
};

export default BookmarksList;
