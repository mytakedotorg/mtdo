import * as React from "react";
import * as ReactDOM from "react-dom";

import TakeEditor from "./components/TakeEditor";

require('./stylesheets/main.scss');

ReactDOM.render(
    <TakeEditor />,
    document.getElementById("app") as HTMLElement
);
