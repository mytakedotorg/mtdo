import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockWriter, {
  BlockWriterState,
  config
} from "./components/BlockWriter";
import FoundationView from "./components/FoundationView";
import { HomeArgs, ShowTakeArgs } from "./takeReader";

interface FoundationArgs {
  type: "foundation";
}

interface NewTakeArgs {
  type: "new-take";
  blockWriterState?: BlockWriterState;
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
      let initJson: BlockWriterState;
      let windowState = window.mytake.blockWriterState;
      if (typeof windowState != "undefined") {
        if (windowState.takeDocument.blocks === null || windowState.takeDocument.blocks.length === 0) {
          windowState = {
            ...windowState,
            takeDocument: {
              ...windowState.takeDocument,
              blocks: [...config.initialState.takeDocument.blocks]
            }
          }
        }
        initJson = windowState;
      } else {
        initJson = config.initialState;
      }

      Root = <BlockWriter initState={initJson} hashUrl={window.location.hash} />;
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
