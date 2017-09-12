import * as React from "react";
import * as ReactDOM from "react-dom";
import FoundationExplorer from "./components/FoundationExplorer";
import { FoundationTextType } from "./components/Foundation";
import { validators } from "./utils/functions";

let app: HTMLElement | null = document.getElementById("app");

let Root;

//if (window.location.hash) {
// Expect hash URL to be like, #/{user}/{article-title}&{range[0]}&{range[1]}&{scrollTop}

let url = window.location.pathname;
let type = url.split("/")[2].toUpperCase();
let hashes = window.location.hash.substring(1).split("&");
let user = hashes[0].split("/")[1];
let articleTitle = hashes[0].split("/")[2];
let range: [number, number] = [parseInt(hashes[1]), parseInt(hashes[2])];
let scrollTop = parseInt(hashes[3]);

// Validate all Props here
if (
  validators.isFoundationTextType(type) &&
  validators.isValidUser(user) &&
  validators.isValidTitle(articleTitle) &&
  !isNaN(range[0]) &&
  !isNaN(range[1]) &&
  !isNaN(scrollTop)
) {
  Root = (
    <FoundationExplorer
      articleTitle={articleTitle}
      articleUser={user}
      range={range}
      scrollTop={scrollTop}
      type={type}
    />
  );

  ReactDOM.render(Root, app);
}

// } else {
// 		// Set Root to some new component
// }
