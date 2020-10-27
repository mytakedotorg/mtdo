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
import { HOMEPAGE_SEARCHES } from "./ngramData";

interface HeadingContent {
  start: string;
  middles: string[];
  end: string;
}
type TypingState = "TYPING" | "STATIC" | "DELETING";

const HEADING_TEXT: HeadingContent = {
  start: "How many times was ",
  middles: HOMEPAGE_SEARCHES,
  end: "said in a presidential debate?",
};
const TYPING_DELAY = 100;
const STATIC_DELAY = 5000;
const DELETING_DELAY = 10;

interface AnimatedHeadingProps {
  onFinishTyping(text: string): void;
}

interface HeadingState {
  text: string;
  middleIndex: number;
  typingState: TypingState;
}
const AnimatedHeading: React.FC<AnimatedHeadingProps> = (props) => {
  const [state, setState] = useState<HeadingState>({
    text: "",
    middleIndex: 0,
    typingState: "TYPING",
  });

  const continueTyping = (currentEndingIndex: number) => {
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        text: HEADING_TEXT.middles[currentEndingIndex].substr(
          0,
          prevState.text.length + 1
        ),
      }));
    }, TYPING_DELAY);
  };

  const continueDeleting = (currentEndingIndex: number) => {
    setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        text: HEADING_TEXT.middles[currentEndingIndex].substr(
          0,
          prevState.text.length - 1
        ),
      }));
    }, DELETING_DELAY);
  };

  useEffect(() => {
    switch (state.typingState) {
      case "TYPING":
        if (
          state.text.length < HEADING_TEXT.middles[state.middleIndex].length
        ) {
          continueTyping(state.middleIndex);
        } else {
          setState((prevState) => ({
            ...prevState,
            typingState: "STATIC",
          }));
        }
        break;
      case "STATIC":
        props.onFinishTyping(HEADING_TEXT.middles[state.middleIndex]);
        const staticDelay =
          isNextSimilar(state.middleIndex) || isPrevSimilar(state.middleIndex)
            ? STATIC_DELAY / 2
            : STATIC_DELAY;
        setTimeout(() => {
          if (isNextSimilar(state.middleIndex)) {
            setState((prevState) => ({
              ...prevState,
              middleIndex: prevState.middleIndex + 1,
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
        if (state.text !== "") {
          continueDeleting(state.middleIndex);
        } else {
          setState((prevState) => ({
            ...prevState,
            middleIndex:
              prevState.middleIndex >= HEADING_TEXT.middles.length - 1
                ? 0
                : prevState.middleIndex + 1,
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
        {state.text}
        <BlinkingCursor />
      </span>
      <span className="animated__span animated__span--fixed">
        {HEADING_TEXT.end}
      </span>
    </>
  );
};

function isNextSimilar(middleIndex: number): boolean {
  if (middleIndex + 1 < HEADING_TEXT.middles.length) {
    const thisText = HEADING_TEXT.middles[middleIndex];
    const nextText = HEADING_TEXT.middles[middleIndex + 1];
    return nextText.startsWith(thisText);
  }
  return false;
}

function isPrevSimilar(middleIndex: number): boolean {
  if (middleIndex > 0) {
    const prevText = HEADING_TEXT.middles[middleIndex - 1];
    const thisText = HEADING_TEXT.middles[middleIndex];
    return thisText.startsWith(prevText);
  }
  return false;
}

export default AnimatedHeading;
