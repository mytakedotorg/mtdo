import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockWriter, {
  InitialBlockWriterState,
  initialState
} from "./components/BlockWriter";
import BlockReader from "./components/BlockReader";
import FeedList from "./components/FeedList";
import FoundationView from "./components/FoundationView";
import SearchBar from "./components/SearchBar";
import { TakeDocument } from "./components/BlockEditor";
import { Card } from "./components/FeedList";
import { alertErr } from "./utils/functions";

interface HomeArgs {
  type: "home";
  cards: Card[];
}

interface ShowTakeArgs {
  type: "showtake";
  takeDocument: TakeDocument;
  takeId: number;
}

interface FoundationArgs {
  type: "foundation";
}

interface NewTakeArgs {
  type: "new-take";
  blockWriterState?: InitialBlockWriterState;
}

declare global {
  interface Window {
    mytake?: HomeArgs | ShowTakeArgs | FoundationArgs | NewTakeArgs;
  } 
}


const app: HTMLElement | null = document.getElementById("app");
if (app) {
	let Root;
	if (typeof window.mytake != "undefined") {
		switch (window.mytake.type) {
			case "foundation":
				Root = <FoundationView path={window.location.pathname} />;
				break;
			case "new-take":
				let initJson: InitialBlockWriterState;
				let windowState = window.mytake.blockWriterState;
				if (typeof windowState != "undefined") {
					if (windowState.takeDocument.blocks === null || windowState.takeDocument.blocks.length === 0) {
						windowState = {
							...windowState,
							takeDocument: {
								...windowState.takeDocument,
								blocks: [...initialState.takeDocument.blocks]
							}
						}
					}
					initJson = windowState;
				} else {
					initJson = (Object as any).assign({}, initialState);
				}

				Root = <BlockWriter initState={initJson} hashUrl={window.location.hash} />;
				break;
			case "home":
				Root = <FeedList cards={window.mytake.cards} />;
				break;
			case "showtake":
				Root = <BlockReader initState={window.mytake.takeDocument} takeId={window.mytake.takeId} />;
				break;
			default:
				alertErr("index: unknown argument structure");
				throw "Unknown argument structure";
		}
	} else {
		alertErr("index: window.mytake is undefined");
		throw "window.mytake is undefined";
	}
  ReactDOM.render(Root, app);
}

const searchBarContainer: HTMLElement | null = document.getElementById("searchbar");
if (searchBarContainer) {
  ReactDOM.render(<SearchBar />, searchBarContainer);
} else {
  alertErr("index: couldn't find div#searchbar");
  throw "Couldn't find div#searchbar";
}
