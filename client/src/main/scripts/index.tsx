import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockWriter, {
  InitialBlockWriterState,
  initialState
} from "./components/BlockWriter";
import BlockReader from "./components/BlockReader";
import FeedList from "./components/FeedList";
import FoundationView from "./components/FoundationView";
import { TakeDocument } from "./components/BlockEditor";

interface HomeArgs {
  type: "home";
}

interface ShowTakeArgs {
  type: "showtake";
  takeDocument: TakeDocument;
}

interface FoundationArgs {
  type: "foundation";
}

interface NewTakeArgs {
  type: "new-take";
  blockWriterState?: InitialBlockWriterState;
}

declare global {
  interface Window {
    mytake?: HomeArgs | ShowTakeArgs | FoundationArgs | NewTakeArgs;
  } 
}

let Root;

if (typeof window.mytake != "undefined") {
  switch (window.mytake.type) {
    case "foundation":
      Root = <FoundationView hashUrl={window.location.hash} />;
      break;
    case "new-take":
      let initJson: InitialBlockWriterState;
      let windowState = window.mytake.blockWriterState;
      if (typeof windowState != "undefined") {
        if (windowState.takeDocument.blocks === null || windowState.takeDocument.blocks.length === 0) {
          windowState = {
            ...windowState,
            takeDocument: {
              ...windowState.takeDocument,
              blocks: [...initialState.takeDocument.blocks]
            }
          }
        }
        initJson = windowState;
      } else {
        initJson = initialState;
      }

      Root = <BlockWriter initState={initJson} hashUrl={window.location.hash} />;
      break;
    case "home":
      Root = <FeedList users={[]}/>;
      throw "TODO: populate the news feed from server data";
      //break;
    case "showtake":
      Root = <BlockReader initState={window.mytake.takeDocument} />;
      break;
    default:
      throw "Unknown argument structure";
  }
} else {
  throw "window.mytake is undefined";
}

const app: HTMLElement | null = document.getElementById("app");

if (app) {
  ReactDOM.render(Root, app);
} else {
  throw "Couldn't find div#app";
}
