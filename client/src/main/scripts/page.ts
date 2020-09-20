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

export function isHomePage(page?: MtdoArgs): page is HomeArgs {
  return (page as HomeArgs)?.type === "home";
}

export function isSearchPage(page?: MtdoArgs): page is SearchArgs {
  return (page as SearchArgs)?.type === "search";
}

export function isBookmarksTab(): boolean {
  return (
    getQueryParameterByName(Routes.PROFILE_TAB) === Routes.PROFILE_TAB_BOOKMARKS
  );
}
