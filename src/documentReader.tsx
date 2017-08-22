import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockReader from "./components/BlockReader";

let app: HTMLElement = document.getElementById("app");

let initJson;
let Root;
if (app.hasAttribute("data-init")) {
  initJson = JSON.parse(app.getAttribute("data-init"));
  Root = <BlockReader initState={initJson} />;
} else {
  Root = <BlockReader />;
}

ReactDOM.render(Root, app);
