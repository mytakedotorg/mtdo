import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditorTester from "./testing/BlockEditorTester";


let app: HTMLElement = document.getElementById("app");

const Root = (
	<BlockEditorTester />
);

ReactDOM.render(Root, app)
