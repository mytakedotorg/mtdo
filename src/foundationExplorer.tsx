import * as React from "react";
import * as ReactDOM from "react-dom";
import FoundationExplorer from "./components/FoundationExplorer";

let app: HTMLElement | null = document.getElementById("app");

let initJson;

let Root = <FoundationExplorer />;

ReactDOM.render(Root, app);
