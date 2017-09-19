import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockReader from "./components/BlockReader";
import { TakeDocument } from "./components/BlockEditor";
import database from "./utils/database";

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

    let user = database.users.filter(user => {
      return user.name === initJson.user;
    })[0];

    let article = user.articles.filter(article => {
      return article.titleSlug === initJson.article;
    })[0];

    let takeDocument: TakeDocument = {
      title: article.title,
      blocks: article.blocks
    };

    Root = <BlockReader initState={takeDocument} />;
  } else {
    Root = <div />;
  }
} else {
  Root = <div />;
}

ReactDOM.render(Root, app);
