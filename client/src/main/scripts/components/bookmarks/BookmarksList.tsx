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
import { BookmarksMode, BookmarksResult } from "./bookmarks";
import BookmarksResultList from "./BookmarksResultList";
import BookmarksSortBy from "./BookmarksSortBy";

interface BookmarksListProps {
  mode: BookmarksMode;
  bookmarksResult: BookmarksResult;
  onModeChange(mode: BookmarksMode): void;
}
const BookmarksList: React.FC<BookmarksListProps> = ({
  bookmarksResult,
  onModeChange,
  mode,
}) => {
  const handlePlayClick = (
    videoFact: FT.VideoFactContent,
    clipRange: [number, number]
  ) => {
    throw "todo";
  };
  return (
    <div className="results">
      <div className="results__inner-container">
        <BookmarksSortBy onChange={onModeChange} selectedOption={mode} />
        <BookmarksResultList
          onPlayClick={handlePlayClick}
          bookmarksResult={bookmarksResult}
        />
      </div>
    </div>
  );
};

export default BookmarksList;
