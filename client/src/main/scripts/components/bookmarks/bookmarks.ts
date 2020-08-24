import { get } from "../../network";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";

export class BookmarksResult {
  constructor(
    public factHits: FactToBookmarkHits[]
  ) {}
}
export enum BookmarksMode {
  DateBookmarked,
  DateHappened,
}

export function getBookmarks(mode: BookmarksMode): Promise<FT.Bookmark[]> {
  // return get<FT.Bookmark[]>(`${Routes.API_BOOKMARKS}`);
  return get<[]>("");
}

interface FactToBookmarkHits {
  fact: FT.VideoFactContent | FT.DocumentFactContent,
  bookmarkHits: BookmarkHit[]
}

type OffsetRange = [start: number, end: number];
export class BookmarkHit {
  constructor(
    readonly offsets: [start: number, end: number],
    readonly savedAt: Date,
    readonly fact: FT.VideoFactContent | FT.DocumentFactContent,
    readonly hash: string
  ) {}
}