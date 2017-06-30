import * as React from "react";
import * as ReactDOM from "react-dom";

import MyTake from "./components/MyTake";

require('./assets/stylesheets/main.scss');

ReactDOM.render(
    <MyTake />,
    document.getElementById("app") as HTMLElement
);
