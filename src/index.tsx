import * as React from "react";
import * as ReactDOM from "react-dom";
import MyTake from "./components/MyTake";
import config from "./components/MyTake/config";

let app = document.getElementById("app");
let initJson;
if (app && app.hasAttribute("data-init")) {
  let data = app.getAttribute("data-init");
  if (data) {
    initJson = JSON.parse(data);
  } else {
    initJson = config.initialState;
  }
} else if (window.location.hash) {
  // Expect hash URL to be like, #{FoundationType}&{URL of Take being read}&{highlightRangeStart}&{highlightRangeEnd}
  // localhost:3000/new-take/#amendments&/samples/does-a-law-mean-what-it-says-or-what-it-meant/&369&514
  let hashes = window.location.hash.toLowerCase().split("&");
  let foundationType = hashes[0].substring(1);
  let article = hashes[1];
  let range = [parseInt(hashes[2]), parseInt(hashes[3])];
  let kind; //document or video
  let blockId; //FoundationTextType or videoId
  switch (foundationType) {
    case "amendments":
      kind = "document";
      blockId = "AMENDMENTS";
      break;
    case "constitution":
      kind = "document";
      blockId = "CONSTITUTION";
      break;
    case "debates":
      kind = "video";
      blockId = "SomethingFromURL";
      break;
    default:
      break;
  }
  if (kind) {
    initJson = {
      takeDocument: {
        title: "",
        blocks: [
          { kind: kind, document: blockId, range: range },
          { kind: "paragraph", text: "" }
        ]
      },
      activeBlockIndex: -1
    };
  } else {
    initJson = config.initialState;
  }
} else {
  initJson = config.initialState;
}

const Root = <MyTake initState={initJson} />;

ReactDOM.render(Root, app);
