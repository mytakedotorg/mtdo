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
import { Routes } from "../../java2ts/Routes";
import { deleteReq, put } from "../../network";
import {
  convertMillisecondsToSeconds,
  convertSecondsToMilliseconds,
} from "../../utils/conversions";

export class BookmarksResult {
  constructor(public factHits: FactToBookmarkHits[]) {}
}

export class _BookmarksWithData {
  constructor(
    public foundationData: Foundation,
    public mode: BookmarksMode,
    public bookmarksRaw: FTBookmarkIntermediate[]
  ) {}
}

export enum BookmarksMode {
  DateBookmarked = "DateBookmarked",
  DateHappened = "DateHappened",
}

export async function getBookmarks(
  mode: BookmarksMode
): Promise<BookmarksResult> {
  const bookmarks = await BookmarksClient.getInstance().getRaw();
  const builder = new FoundationFetcher();
  bookmarks.forEach((b) => builder.add(b.fact));
  const foundationData = await builder.build();
  return _bookmarksImpl(
    new _BookmarksWithData(foundationData, mode, bookmarks)
  );
}

export function _bookmarksImpl(
  bookmarksWithData: _BookmarksWithData
): BookmarksResult {
  const { foundationData, mode, bookmarksRaw } = bookmarksWithData;
  const bookmarks = parseBookmarksJSON(bookmarksRaw);

  let groupedByFact: Bookmark[][];
  switch (mode) {
    case BookmarksMode.DateHappened:
      groupedByFact = Array.from(
        groupBy(bookmarks, (b) => b.content.fact).values()
      );
      break;
    case BookmarksMode.DateBookmarked:
      const sortedByDateBookmarked = bookmarks.sort(
        (a, b) => a.savedAt.getTime() - b.savedAt.getTime()
      );
      groupedByFact = [];
      let previousFact = "";
      let bookmarkGroup: Bookmark[] = [];
      sortedByDateBookmarked.forEach((b) => {
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
    groupedByFact
      .map((bookmarkList) => {
        const hash = bookmarkList[0].content.fact;
        return {
          hash,
          bookmarkHits: bookmarkList.map((b) => {
            return new BookmarkHit(foundationData.getFactContent(hash), b);
          }),
        };
      })
      .sort((a, b) => {
        switch (mode) {
          case BookmarksMode.DateHappened:
            return (
              new Date(a.bookmarkHits[0].fact.fact.primaryDate).getTime() -
              new Date(b.bookmarkHits[0].fact.fact.primaryDate).getTime()
            );
          case BookmarksMode.DateBookmarked:
            return 0; //already sorted
        }
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

interface FTBookmarkIntermediate {
  fact: string;
  start: number;
  end: number;
  savedAt: string;
}

export interface Bookmark {
  savedAt: Date;
  content: VideoCut;
}

function parseBookmarksJSON(json: FTBookmarkIntermediate[]): Bookmark[] {
  return json.map(intermediateToBookmark);
}

export function intermediateToBookmark(i: FTBookmarkIntermediate): Bookmark {
  return {
    content: {
      cut: [
        convertMillisecondsToSeconds(i.start),
        convertMillisecondsToSeconds(i.end),
      ],
      fact: i.fact,
      kind: "videoCut",
    },
    savedAt: new Date(i.savedAt),
  };
}

export function bookmarkToIntermediate(
  bookmark: Bookmark
): FTBookmarkIntermediate {
  return {
    fact: bookmark.content.fact,
    start: convertSecondsToMilliseconds(bookmark.content.cut[0]),
    end: convertSecondsToMilliseconds(bookmark.content.cut[1]),
    savedAt: bookmark.savedAt.toISOString(),
  };
}

export class BookmarksClient {
  static instance = new BookmarksClient();

  private constructor() {}

  static getInstance(): BookmarksClient {
    return this.instance;
  }

  async getRaw(): Promise<FTBookmarkIntermediate[]> {
    const response = await fetch(
      new Request(Routes.API_BOOKMARKS, {
        method: "get",
        headers: {
          "If-Modified-Since": new Date().toUTCString(),
        },
      })
    );
    return response.json();
  }

  async get(): Promise<Bookmark[]> {
    return parseBookmarksJSON(await this.getRaw());
  }

  /**
   * If you want, you could set the date of the results to this server-supplied date.
   * It's super unimportant, completely fine to ignore it.
   */
  async add(bookmarks: FTBookmarkIntermediate[]): Promise<Date> {
    return put(Routes.API_BOOKMARKS, bookmarks);
  }

  async remove(bookmarks: FTBookmarkIntermediate[]): Promise<Response> {
    return deleteReq(Routes.API_BOOKMARKS, bookmarks);
  }
}

export function isBookmarkEqualToSocial(
  bookmark: Bookmark,
  social: VideoCut
): boolean {
  const normalizedSocialCut = social.cut.map((t) => Math.round(t));
  const normalizedBookmarkCut = bookmark.content.cut.map((t) => Math.round(t));
  return (
    bookmark.content.fact === social.fact &&
    bookmark.content.kind === social.kind &&
    normalizedBookmarkCut[0] === normalizedSocialCut[0] &&
    normalizedBookmarkCut[1] === normalizedSocialCut[1]
  );
}
