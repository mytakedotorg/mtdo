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
import * as React from "react";
import { BookmarksMode } from "./bookmarks";

interface BookmarksSortByProps {
  onChange(mode: BookmarksMode): void;
  selectedOption: BookmarksMode;
}

function sortOptionName(mode: keyof typeof BookmarksMode): string {
  switch (mode) {
    case "DateBookmarked":
      return "Date bookmarked";
    case "DateHappened":
      return "Date happened";
  }
}

const BookmarksSortBy: React.FC<BookmarksSortByProps> = ({
  onChange,
  selectedOption,
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(BookmarksMode[event.target.value as keyof typeof BookmarksMode]);
  };
  return (
    <div className="sortby">
      <label htmlFor="bookmarks-sortby">Sort by:</label>
      <select
        name="sortby"
        id="bookmarks-sortby"
        value={selectedOption}
        onChange={handleChange}
      >
        {Object.keys(BookmarksMode).map((mode) => (
          <option value={mode}>
            {sortOptionName(mode as keyof typeof BookmarksMode)}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BookmarksSortBy;
