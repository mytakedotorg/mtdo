/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
import React, { useEffect, useState } from "react";
import BlinkingCursor from "./BlinkingCursor";
import { HitsPerYearList } from "../search/NGramViewer";

export const SEARCHES = [
  "election",
  "election, rigged",
  "supreme court",
  "global warming",
  "saddam",
  "saddam, bin laden",
  "gun control",
  "gun control, second amendment",
  "wall",
  "wall, -wall street",
];

export interface NgramData {
  [index: string]: HitsPerYearList;
}

interface HeadingContent {
  start: string;
  end: string;
}
type TypingState = "TYPING" | "STATIC" | "DELETING";

const HEADING_TEXT: HeadingContent = {
  start: "How many times was ",
  end: "said in a presidential debate?",
};
const TYPING_DELAY = 100;
const STATIC_DELAY = 3000;
const DELETING_DELAY = 10;

interface AnimatedHeadingProps {
  onFinishTyping(text: string): void;
}

interface HeadingState {
  searchTxt: string;
  searchIdx: number;
  typingState: TypingState;
}
const AnimatedHeading: React.FC<AnimatedHeadingProps> = (props) => {
  const [state, setState] = useState<HeadingState>({
    searchTxt: "",
    searchIdx: 0,
    typingState: "TYPING",
  });

  const continueTyping = (currentEndingIndex: number) => {
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        searchTxt: SEARCHES[currentEndingIndex].substr(
          0,
          prevState.searchTxt.length + 1
        ),
      }));
    }, TYPING_DELAY);
  };

  const continueDeleting = (currentEndingIndex: number) => {
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        searchTxt: SEARCHES[currentEndingIndex].substr(
          0,
          prevState.searchTxt.length - 1
        ),
      }));
    }, DELETING_DELAY);
  };

  useEffect(() => {
    switch (state.typingState) {
      case "TYPING":
        if (state.searchTxt.length < SEARCHES[state.searchIdx].length) {
          continueTyping(state.searchIdx);
        } else {
          setState((prevState) => ({
            ...prevState,
            typingState: "STATIC",
          }));
        }
        break;
      case "STATIC":
        props.onFinishTyping(SEARCHES[state.searchIdx]);
        const staticDelay =
          isNextSimilar(state.searchIdx) || isPrevSimilar(state.searchIdx)
            ? STATIC_DELAY / 2
            : STATIC_DELAY;
        setTimeout(() => {
          if (isNextSimilar(state.searchIdx)) {
            setState((prevState) => ({
              ...prevState,
              searchIdx: prevState.searchIdx + 1,
              typingState: "TYPING",
            }));
          } else {
            setState((prevState) => ({
              ...prevState,
              typingState: "DELETING",
            }));
          }
        }, staticDelay);
        break;
      case "DELETING":
        if (state.searchTxt !== "") {
          continueDeleting(state.searchIdx);
        } else {
          setState((prevState) => ({
            ...prevState,
            searchIdx:
              prevState.searchIdx >= SEARCHES.length - 1
                ? 0
                : prevState.searchIdx + 1,
            typingState: "TYPING",
          }));
        }
        break;
    }
  }, [state]);

  return (
    <>
      <span className="animated__span animated__span--fixed">
        {HEADING_TEXT.start}
      </span>
      <span className="animated__span animated__span--typed">
        {state.searchTxt}
        <BlinkingCursor />
      </span>
      <span className="animated__span animated__span--fixed">
        {HEADING_TEXT.end}
      </span>
    </>
  );
};

function isNextSimilar(searchIdx: number): boolean {
  if (searchIdx + 1 < SEARCHES.length) {
    const thisText = SEARCHES[searchIdx];
    const nextText = SEARCHES[searchIdx + 1];
    return nextText.startsWith(thisText);
  }
  return false;
}

function isPrevSimilar(searchIdx: number): boolean {
  if (searchIdx > 0) {
    const prevText = SEARCHES[searchIdx - 1];
    const thisText = SEARCHES[searchIdx];
    return thisText.startsWith(prevText);
  }
  return false;
}

export default AnimatedHeading;
