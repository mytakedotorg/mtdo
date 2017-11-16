import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockReader from "./components/BlockReader";
import FeedList from "./components/FeedList";
import { TakeDocument } from "./components/BlockEditor";
import { getArticle } from "./utils/databaseAPI";

interface HomeArgs {
  type: "home";
}

interface ShowTakeArgs {
  type: "showtake";
  takeDocument: TakeDocument;
}

declare global {
  interface Window {
    mytake?: HomeArgs | ShowTakeArgs;
  }
}

let Root;

if (typeof window.mytake != "undefined") {
  switch (window.mytake.type) {
    case "home":
      Root = <FeedList />;
      break;
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
