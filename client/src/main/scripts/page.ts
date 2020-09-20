import { getQueryParameterByName } from "./common/functions";
import { TakeDocument } from "./components/BlockEditor";
import { InitialBlockWriterState } from "./components/BlockWriter";
import { Routes } from "./java2ts/Routes";

interface HomeArgs {
  type: "home";
}

interface ShowTakeArgs {
  type: "showtake";
  takeDocument: TakeDocument;
  takeId: number;
}

interface FoundationArgs {
  type: "foundation";
}

interface NewTakeArgs {
  type: "new-take";
  blockWriterState?: InitialBlockWriterState;
}

interface SearchArgs {
  type: "search";
  searchTerm: string;
}

export type MtdoArgs =
  | HomeArgs
  | ShowTakeArgs
  | FoundationArgs
  | NewTakeArgs
  | SearchArgs;

declare global {
  interface Window {
    mytake?: MtdoArgs;
  }
}

export function isSearchPage(page?: MtdoArgs): page is SearchArgs {
  return (page as SearchArgs)?.type === "search";
}

export function isBookmarksTab(): boolean {
  return (
    getQueryParameterByName(Routes.PROFILE_TAB) === Routes.PROFILE_TAB_BOOKMARKS
  );
}
