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
import { FoundationHarness } from "../../common/foundationTest";
import {
  Bookmark,
  BookmarksMode,
  _bookmarksImpl,
  _BookmarksWithData,
} from "./bookmarks";
import BookmarksList, { BookmarksListEventHandlers } from "./BookmarksList";
import { BookmarksResultListProps } from "./BookmarksResultList";
import samplebookmarks from "./testData/samplebookmarks.json";

jest.mock("./BookmarksSortBy", () => ({
  __esModule: true,
  default: "BookmarksSortBy",
}));

jest.mock("./BookmarksResultList", () => ({
  __esModule: true,
  default: (props: BookmarksResultListProps) => {
    const { bookmarksResult } = props;
    return (
      <div>BookmarksResultList: {bookmarksResult.factHits.length} hits</div>
    );
  },
}));

const eventHandlers: BookmarksListEventHandlers = {
  onModeChange: jest.fn(),
  onRemoveBookmark: jest.fn(),
  onUndoRemoveBookmark: jest.fn(),
  onConfirmRemoval: jest.fn(),
};

test("BookmarksList date happened", () => {
  const result = _bookmarksImpl(
    new _BookmarksWithData(
      FoundationHarness.loadAllFromDisk(),
      BookmarksMode.DateHappened,
      samplebookmarks.bookmarks
    )
  );

  const tree = renderer
    .create(
      <BookmarksList
        bookmarksToRemove={[]}
        mode={BookmarksMode.DateHappened}
        eventHandlers={eventHandlers}
        bookmarksResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("BookmarksList date bookmarked", () => {
  const result = _bookmarksImpl(
    new _BookmarksWithData(
      FoundationHarness.loadAllFromDisk(),
      BookmarksMode.DateBookmarked,
      samplebookmarks.bookmarks
    )
  );

  const tree = renderer
    .create(
      <BookmarksList
        bookmarksToRemove={[]}
        mode={BookmarksMode.DateBookmarked}
        eventHandlers={eventHandlers}
        bookmarksResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("BookmarksList no results", () => {
  const result = _bookmarksImpl(
    new _BookmarksWithData(
      FoundationHarness.loadAllFromDisk(),
      BookmarksMode.DateHappened,
      []
    )
  );

  const tree = renderer
    .create(
      <BookmarksList
        bookmarksToRemove={[]}
        mode={BookmarksMode.DateHappened}
        eventHandlers={eventHandlers}
        bookmarksResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("BookmarksList date happened - one marked for removal", () => {
  const result = _bookmarksImpl(
    new _BookmarksWithData(
      FoundationHarness.loadAllFromDisk(),
      BookmarksMode.DateHappened,
      samplebookmarks.bookmarks
    )
  );

  const bookmarksToRemove: Bookmark[] = [
    result.factHits[0].bookmarkHits[0].bookmark,
  ];

  const tree = renderer
    .create(
      <BookmarksList
        bookmarksToRemove={bookmarksToRemove}
        mode={BookmarksMode.DateHappened}
        eventHandlers={eventHandlers}
        bookmarksResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
