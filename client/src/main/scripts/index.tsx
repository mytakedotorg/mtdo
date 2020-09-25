/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import * as ReactDOM from "react-dom";
import Modal from "react-modal";
import { windowUtils } from "./browser";
import BlockReader from "./components/BlockReader";
import BlockWriter, {
  InitialBlockWriterState,
  initialState,
} from "./components/BlockWriter";
import FoundationView from "./components/FoundationView";
import HeaderWithPage from "./components/homepage/HeaderWithPage";
import Home from "./components/Homepage/Home";
import VideoResultsLoader from "./components/search/VideoResultsLoader";
import { MtdoArgs } from "./page";

windowUtils.init();

function reactElementForPage(args?: MtdoArgs): JSX.Element | undefined {
  switch (args?.type) {
    case "foundation":
      return <FoundationView path={window.location.pathname} />;
    case "new-take":
      let initJson: InitialBlockWriterState;
      if (args.blockWriterState) {
        initJson = args.blockWriterState;
        if (!initJson.takeDocument.blocks) {
          initJson = {
            ...initJson,
            takeDocument: {
              ...initJson.takeDocument,
              blocks: [...initialState.takeDocument.blocks],
            },
          };
        }
      } else {
        initJson = (Object as any).assign({}, initialState);
      }
      return (
        <BlockWriter initState={initJson} hashUrl={window.location.hash} />
      );
    case "home":
      return <Home />;
    case "showtake":
      return <BlockReader initState={args.takeDocument} takeId={args.takeId} />;
    case "search":
      return <VideoResultsLoader searchQuery={args.searchTerm} />;
  }
}

function pageElementWithHeader(): JSX.Element {
  return (
    <HeaderWithPage args={window.mytake}>
      {reactElementForPage(window.mytake)}
    </HeaderWithPage>
  );
}
const app = document.getElementById("app");
if (app) {
  ReactDOM.render(pageElementWithHeader(), app);
  Modal.setAppElement(app);
}
