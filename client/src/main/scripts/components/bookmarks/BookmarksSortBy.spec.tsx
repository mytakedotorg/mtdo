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
import * as React from "react";
import * as renderer from "react-test-renderer";
import { BookmarksMode } from "./bookmarks";
import BookmarksSortBy from "./BookmarksSortBy";

test("BookmarksSortBy Date Bookmarked", () => {
  const tree = renderer
    .create(
      <BookmarksSortBy
        onChange={jest.fn()}
        selectedOption={BookmarksMode.DateBookmarked}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("BookmarksSortBy Date Happened", () => {
  const tree = renderer
    .create(
      <BookmarksSortBy
        onChange={jest.fn()}
        selectedOption={BookmarksMode.DateHappened}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
