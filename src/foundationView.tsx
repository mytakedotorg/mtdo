import * as React from "react";
import * as ReactDOM from "react-dom";
import TimelineView from "./components/TimelineView";

let app: HTMLElement | null = document.getElementById("app");

let Root = <TimelineView />;

ReactDOM.render(Root, app);
