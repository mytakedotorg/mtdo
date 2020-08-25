import { get } from "../../network";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import { Foundation, FoundationFetcher } from "../../common/foundation";
import sampleBookmarks from "./samplebookmarks.json"
import { groupBy } from "../../common/functions";

export class BookmarksResult {
  constructor(
    public factHits: FactToBookmarkHits[]
  ) {}
}

export class _BookmarksWithData {
  constructor(
    public foundationData: Foundation,
    public mode: BookmarksMode,
    public bookmarks: FT.Bookmark[]
  ) {}
}

export enum BookmarksMode {
  DateBookmarked = "DateBookmarked",
  DateHappened = "DateHappened",
}

export async function getBookmarks(mode: BookmarksMode): Promise<BookmarksResult> {
  const bookmarks = parseBookmarksJSON(await _getTemp())
  const builder = new FoundationFetcher();
  bookmarks.forEach((b) => builder.add(b.fact));
  const foundationData = await builder.build();
  return _bookmarksImpl(
    new _BookmarksWithData(foundationData, mode, bookmarks)
  );
}

function _bookmarksImpl(bookmarksWithData: _BookmarksWithData): BookmarksResult {
  const { foundationData, mode, bookmarks } = bookmarksWithData;

  let groupedByFact: FT.Bookmark[][];
  switch (mode) {
    case BookmarksMode.DateHappened:
      groupedByFact = Array.from(groupBy(bookmarks, (b) => b.fact).values());
      break;
    case BookmarksMode.DateBookmarked:
      const sortedByDate = bookmarks.sort((a, b) => a.savedAt.getUTCDate() - b.savedAt.getUTCDate())
      groupedByFact = [];
      let previousFact = "";
      let bookmarkGroup: FT.Bookmark[] = [];
      sortedByDate.forEach(b => {
        if (b.fact !== previousFact) {
          if (bookmarkGroup.length > 0) {
            groupedByFact.push(bookmarkGroup);
          }
          previousFact = b.fact;
          bookmarkGroup = [];
        }
        bookmarkGroup.push(b);
      })
      if (bookmarkGroup.length > 0) {
        groupedByFact.push(bookmarkGroup);
      }
      break;
  }
  return new BookmarksResult(
    groupedByFact.map((bookmarkList) => {
      return {
        hash: bookmarkList[0].fact,
        bookmarkHits: bookmarkList.map(b => {
          return new BookmarkHit([b.start, b.start], b.savedAt, foundationData.getFactContent(b.fact))
        })
      }
    })
  );
}

interface FactToBookmarkHits {
  hash: string,
  bookmarkHits: BookmarkHit[]
}

export class BookmarkHit {
  constructor(
    readonly offsets: [start: number, end: number],
    readonly savedAt: Date,
    readonly fact: FT.VideoFactContent | FT.DocumentFactContent,
  ) {}
}

/**
 * @deprecated TODO until bookmarks endpoint is available
 */
function _getTemp(): Promise<FTBookmarkIntermediate[]> {
  return new Promise(res => {
    res(sampleBookmarks.bookmarks as FTBookmarkIntermediate[]);
  })
}

interface FTBookmarkIntermediate {
  fact: string;
  start: number;
  end: number;
  savedAt: string;
}

function parseBookmarksJSON(json: FTBookmarkIntermediate[]): FT.Bookmark[] {
  return json.map(b => ({
    ...b,
    savedAt: new Date(b.savedAt)
  }))
}
