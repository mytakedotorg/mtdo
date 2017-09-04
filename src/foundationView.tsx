import * as React from "react";
import * as ReactDOM from "react-dom";
import Timeline from "./components/Timeline";

let app: HTMLElement | null = document.getElementById("app");

let Root = <Timeline />;

ReactDOM.render(Root, app);
