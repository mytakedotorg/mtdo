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
  VideoResultEventHandlers,
  VideoResultProps,
} from "../shared/VideoResult";
import { BookmarksMode, _bookmarksImpl, _BookmarksWithData } from "./bookmarks";
import BookmarksResultList from "./BookmarksResultList";
import samplebookmarks from "./testData/samplebookmarks.json";

jest.mock("../shared/VideoResult", () => ({
  __esModule: true,
  default: (props: VideoResultProps) => {
    const { videoTurn, videoFact } = props;
    return (
      <div>
        VideoResult: {videoFact.youtubeId} {videoTurn.turn} {videoTurn.cut}
      </div>
    );
  },
}));

const eventHandlers: VideoResultEventHandlers = {
  onPlayClick: jest.fn(),
  onRemoveBookmark: jest.fn(),
  onAddBookmark: jest.fn(),
};

test("BookmarksResultList DateHappened", () => {
  const result = _bookmarksImpl(
    new _BookmarksWithData(
      FoundationHarness.loadAllFromDisk(),
      BookmarksMode.DateHappened,
      samplebookmarks.bookmarks
    )
  );

  const tree = renderer
    .create(
      <BookmarksResultList
        bookmarks={[]}
        eventHandlers={eventHandlers}
        bookmarksResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("BookmarksResultList DateBookmarked", () => {
  const result = _bookmarksImpl(
    new _BookmarksWithData(
      FoundationHarness.loadAllFromDisk(),
      BookmarksMode.DateBookmarked,
      samplebookmarks.bookmarks
    )
  );

  const tree = renderer
    .create(
      <BookmarksResultList
        bookmarks={[]}
        eventHandlers={eventHandlers}
        bookmarksResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("BookmarksResultList no results", () => {
  const result = _bookmarksImpl(
    new _BookmarksWithData(
      FoundationHarness.loadAllFromDisk(),
      BookmarksMode.DateHappened,
      []
    )
  );

  const tree = renderer
    .create(
      <BookmarksResultList
        bookmarks={[]}
        eventHandlers={eventHandlers}
        bookmarksResult={result}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
