import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockReader from "./components/BlockReader";

let app: HTMLElement | null = document.getElementById("app");

let initJson;
let Root;
if (app && app.hasAttribute("data-init")) {
  let data = app.getAttribute("data-init");
  if (data) {
    initJson = JSON.parse(data);
    Root = <BlockReader initState={initJson} />;
  } else {
    Root = <div />;
  }
} else {
  Root = <div />;
}

ReactDOM.render(Root, app);
