import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockReader from "./components/BlockReader";
import FeedList from "./components/FeedList";
import { TakeDocument } from "./components/BlockEditor";
import { getArticle } from "./utils/databaseAPI";

let app: HTMLElement | null = document.getElementById("app");

let Root;

if (window.location.pathname === "/") {
  Root = <FeedList />;
} else if (app) {
  let data = app.getAttribute("data-init");
  if (data) {
    let initJson: TakeDocument = JSON.parse(data);
    Root = <BlockReader initState={initJson} />;
  } else {
    throw "Error reading data-init attribute";
  }
} else {
  throw "Couldn't find div#app";
}

ReactDOM.render(Root, app);
