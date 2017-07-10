import * as React from "react";
import * as ReactDOM from "react-dom";
const { Raw } = require('slate');
import MyTake from "./components/MyTake";
import config from "./components/MyTake/config";

require('./assets/stylesheets/main.scss');

let app: HTMLElement = document.getElementById("app");
let initJson;
if (app.hasAttribute('data-init')) {
    initJson = JSON.parse(app.getAttribute('data-init'));
} else {
    initJson = config.initialState;
}
let initStateParsed = Raw.deserialize(initJson, { terse: true });

ReactDOM.render(<MyTake initState={initStateParsed}/>, app)
