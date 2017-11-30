import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockWriter, {
  BlockWriterState,
  config
} from "./components/BlockWriter";
import Foundation from "./components/Foundation";
import Fact from "./components/Fact";
import { fetchFact, validators } from "./utils/functions";
import { isDocument, isVideo } from "./utils/databaseData";
import { HomeArgs, ShowTakeArgs } from "./takeReader";

interface FoundationArgs {
  type: "foundation";
}

interface NewTakeArgs {
  type: "new-take";
  blockWriterState?: BlockWriterState;
}

declare global {
  interface Window {
    mytake?: HomeArgs | ShowTakeArgs | FoundationArgs | NewTakeArgs;
  } 
}

let Root;

if (typeof window.mytake != "undefined") {
  switch (window.mytake.type) {
    case "foundation":
      let url = window.location.pathname;
      let excerptId = url.split("/")[2];

      if (!excerptId) {
        // mytake.org/foundation/ route
        Root = <Foundation />;
      } else {
        // e.g. mytake.org/foundation/bill-of-rights
        let hashes = window.location.hash.substring(1).split("&");
        let user = hashes[0].split("/")[1];
        let articleTitle = hashes[0].split("/")[2];
        let highlighedRange: [number, number] = [
          parseInt(hashes[1]),
          parseInt(hashes[2])
        ];
        let viewRange: [number, number] = [
          parseInt(hashes[3]),
          parseInt(hashes[4])
        ];
        let scrollTop = parseInt(hashes[5]);

        // Validate all Props here
        if (
          validators.isValidUser(user) &&
          validators.isValidTitle(articleTitle) &&
          !isNaN(highlighedRange[0]) &&
          !isNaN(highlighedRange[1]) &&
          !isNaN(viewRange[0]) &&
          !isNaN(viewRange[1]) &&
          !isNaN(scrollTop)
        ) {
          Root = (
            <Fact
              articleTitle={articleTitle}
              articleUser={user}
              scrollTop={scrollTop}
              highlightedRange={highlighedRange}
              viewRange={viewRange}
              excerptId={excerptId}
            />
          );
        } else {
          throw "TODO: Render route like /foundation/bill-of-rights with empty hash URL";
        }
      }
      break;
    case "new-take":
      let initJson: BlockWriterState;
      let windowState = window.mytake.blockWriterState;
      if (typeof windowState != "undefined") {
        if (windowState.takeDocument.blocks === null || windowState.takeDocument.blocks.length === 0) {
          windowState = {
            ...windowState,
            takeDocument: {
              ...windowState.takeDocument,
              blocks: [...config.initialState.takeDocument.blocks]
            }
          }
        }
        initJson = windowState;
      } else if (window.location.hash) {
        // Expect hash URL to be like, #{FoundationType}&{highlightRangeStart}&{highlightRangeEnd}&{viewRangeStart}&{viewRangeEnd}&{URL of Take being read}
        // localhost:3000/new-take/#amendments&369&514&/samples/does-a-law-mean-what-it-says-or-what-it-meant/
        let hashes = window.location.hash.split("&");
        let excerptId = hashes[0].substring(1);
        let highlightedRange: [number, number] = [
          parseFloat(hashes[1]),
          parseFloat(hashes[2])
        ];
        let viewRange: [number, number] = [
          parseFloat(hashes[3]),
          parseFloat(hashes[4])
        ];

        throw "todo";
        // let fact = getFact(excerptId);
        // if (isDocument(fact)) {
        //   if (!isNaN(highlightedRange[0]) && !isNaN(highlightedRange[1])) {
        //     initJson = {
        //       takeDocument: {
        //         title: "",
        //         blocks: [
        //           {
        //             kind: "document",
        //             excerptId: excerptId,
        //             highlightedRange: highlightedRange,
        //             viewRange: viewRange
        //           },
        //           { kind: "paragraph", text: "" }
        //         ]
        //       },
        //       activeBlockIndex: -1,
        //       status: "INITIAL"
        //     };
        //   } else {
        //     initJson = config.initialState;
        //   }
        // } else if (isVideo(fact)) {
        //   if (!isNaN(highlightedRange[0]) && !isNaN(highlightedRange[1])) {
        //     initJson = {
        //       takeDocument: {
        //         title: "",
        //         blocks: [
        //           {
        //             kind: "video",
        //             videoId: excerptId,
        //             range: highlightedRange
        //           },
        //           { kind: "paragraph", text: "" }
        //         ]
        //       },
        //       activeBlockIndex: -1,
        //       status: "INITIAL"
        //     };
        //   } else {
        //     initJson = config.initialState;
        //   }
        // } else {
        //   initJson = config.initialState;
        // }
      } else {
        initJson = config.initialState;
      }

      Root = <BlockWriter initState={initJson} />;
      break;
    default:
      throw "Unknown argument structure";
  }
} else {
  throw "window.mytake is undefined";
}

const app: HTMLElement | null = document.getElementById("app");

if (app) {
  ReactDOM.render(Root, app);
} else {
  throw "Couldn't find div#app";
}
