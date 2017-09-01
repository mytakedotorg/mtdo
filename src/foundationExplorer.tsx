import * as React from "react";
import * as ReactDOM from "react-dom";
import FoundationExplorer from "./components/FoundationExplorer";
import { FoundationTextType } from "./components/Foundation";

let app: HTMLElement | null = document.getElementById("app");

let Root;

function isFoundationTextType(type: string): type is FoundationTextType {
  return type === "AMENDMENTS" || type === "CONSTITUTION";
}

//if (window.location.hash) {
// Expect hash URL to be like, #/{user}/{article-title}&{block-index}&{scrollTop}

let url = window.location.pathname;
let type = url.split("/")[2].toUpperCase();
let hashes = window.location.hash.split("&");
let user = hashes[0].substring(1).split("/")[1];
let articleTitle = hashes[0].substring(1).split("/")[2];
let blockIndex = parseInt(hashes[1]);
let range: [number, number] = [parseInt(hashes[2]), parseInt(hashes[3])];
let scrollTop = parseInt(hashes[4]);

// Should validate all Props here
if (isFoundationTextType(type)) {
  Root = (
    <FoundationExplorer
      articleTitle={articleTitle}
      articleUser={user}
      blockIndex={blockIndex}
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
