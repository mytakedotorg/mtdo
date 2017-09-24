import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockReader from "./components/BlockReader";
import { TakeDocument } from "./components/BlockEditor";
import { getArticle } from "./utils/databaseAPI";

interface InitJSON {
  user: string;
  article: string;
}

let app: HTMLElement | null = document.getElementById("app");

let Root;
if (app && app.hasAttribute("data-init")) {
  let data = app.getAttribute("data-init");
  if (data) {
    let initJson: InitJSON = JSON.parse(data);

    let article = getArticle(initJson.user, initJson.article);

    if (article) {
      let takeDocument: TakeDocument = {
        title: article.title,
        blocks: article.blocks
      };

      Root = <BlockReader initState={takeDocument} />;
    } else {
      // Error getting article
      Root = <div />;
    }
  } else {
    // Error parsing data
    Root = <div />;
  }
} else {
  // Error finding root node
  Root = <div />;
}

ReactDOM.render(Root, app);
