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
import { Foundation, FoundationFetcher } from "../../common/foundation";
import { groupBy } from "../../common/functions";
import { VideoCut } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import sampleBookmarks from "./samplebookmarks.json";

export class BookmarksResult {
  constructor(public factHits: FactToBookmarkHits[]) {}
}

export class _BookmarksWithData {
  constructor(
    public foundationData: Foundation,
    public mode: BookmarksMode,
    public bookmarks: Bookmark[]
  ) {}
}

export enum BookmarksMode {
  DateBookmarked = "DateBookmarked",
  DateHappened = "DateHappened",
}

export async function getBookmarks(
  mode: BookmarksMode
): Promise<BookmarksResult> {
  const bookmarks = parseBookmarksJSON(await _getTemp());
  const builder = new FoundationFetcher();
  bookmarks.forEach((b) => builder.add(b.content.fact));
  const foundationData = await builder.build();
  return _bookmarksImpl(
    new _BookmarksWithData(foundationData, mode, bookmarks)
  );
}

export function _bookmarksImpl(
  bookmarksWithData: _BookmarksWithData
): BookmarksResult {
  const { foundationData, mode, bookmarks } = bookmarksWithData;

  let groupedByFact: Bookmark[][];
  switch (mode) {
    case BookmarksMode.DateHappened:
      groupedByFact = Array.from(
        groupBy(bookmarks, (b) => b.content.fact).values()
      );
      break;
    case BookmarksMode.DateBookmarked:
      const sortedByDate = bookmarks.sort(
        (a, b) => a.savedAt.getUTCDate() - b.savedAt.getUTCDate()
      );
      groupedByFact = [];
      let previousFact = "";
      let bookmarkGroup: Bookmark[] = [];
      sortedByDate.forEach((b) => {
        if (b.content.fact !== previousFact) {
          if (bookmarkGroup.length > 0) {
            groupedByFact.push(bookmarkGroup);
          }
          previousFact = b.content.fact;
          bookmarkGroup = [];
        }
        bookmarkGroup.push(b);
      });
      if (bookmarkGroup.length > 0) {
        groupedByFact.push(bookmarkGroup);
      }
      break;
  }
  return new BookmarksResult(
    groupedByFact.map((bookmarkList) => {
      const hash = bookmarkList[0].content.fact;
      return {
        hash,
        bookmarkHits: bookmarkList.map((b) => {
          return new BookmarkHit(foundationData.getFactContent(hash), b);
        }),
      };
    })
  );
}

interface FactToBookmarkHits {
  hash: string;
  bookmarkHits: BookmarkHit[];
}

export class BookmarkHit {
  constructor(
    readonly fact: FT.VideoFactContent | FT.DocumentFactContent,
    readonly bookmark: Bookmark
  ) {}
}

/**
 * @deprecated TODO until bookmarks endpoint is available
 */
function _getTemp(): Promise<FTBookmarkIntermediate[]> {
  return new Promise((res) => {
    res(sampleBookmarks.bookmarks as FTBookmarkIntermediate[]);
  });
}

interface FTBookmarkIntermediate {
  fact: string;
  start: number;
  end: number;
  savedAt: string;
}

interface Bookmark {
  savedAt: Date;
  content: VideoCut;
}

function parseBookmarksJSON(json: FTBookmarkIntermediate[]): Bookmark[] {
  return json.map((b) => ({
    content: {
      cut: [b.start, b.end],
      fact: b.fact,
      kind: "videoCut",
    },
    savedAt: new Date(b.savedAt),
  }));
}
