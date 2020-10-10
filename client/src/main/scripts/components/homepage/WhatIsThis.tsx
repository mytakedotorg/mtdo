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
import HomeSection from "./HomeSection";

interface WhatIsThisProps {
  leftSocial: React.ReactElement;
  rightSocial: React.ReactElement;
}

interface HeadingContent {
  start: string;
  endings: string[];
}
const HEADING_TEXT: HeadingContent = {
  start: "Is this ",
  endings: ["out of context?", "what was said?"],
};
const TYPING_DELAY = 100;
const STATIC_DELAY = 2000;
const DELETING_DELAY = 10;
type TypingState = "TYPING" | "STATIC" | "DELETING";
const WhatIsThis: React.FC<WhatIsThisProps> = (props) => {
  const [headingText, setHeadingText] = useState(HEADING_TEXT.start);
  const [endingIndex, setEndingIndex] = useState(0);
  const [typingState, setTypingState] = useState<TypingState>("TYPING");

  const continueTyping = (currentEndingIndex: number) => {
    setTimeout(() => {
      setHeadingText(
        (prevText) =>
          HEADING_TEXT.start +
          HEADING_TEXT.endings[currentEndingIndex].substr(
            0,
            prevText.length + 1 - HEADING_TEXT.start.length
          )
      );
    }, TYPING_DELAY);
  };

  const continueDeleting = (currentEndingIndex: number) => {
    setTimeout(() => {
      setHeadingText(
        (prevText) =>
          HEADING_TEXT.start +
          HEADING_TEXT.endings[currentEndingIndex].substr(
            0,
            prevText.length - 1 - HEADING_TEXT.start.length
          )
      );
    }, DELETING_DELAY);
  };

  useEffect(() => {
    switch (typingState) {
      case "TYPING":
        if (
          headingText !==
          HEADING_TEXT.start + HEADING_TEXT.endings[endingIndex]
        ) {
          continueTyping(endingIndex);
        } else {
          setTypingState("STATIC");
        }
        break;
      case "STATIC":
        setTimeout(() => {
          setTypingState("DELETING");
        }, STATIC_DELAY);
        break;
      case "DELETING":
        if (headingText !== HEADING_TEXT.start) {
          continueDeleting(endingIndex);
        } else {
          setTypingState("TYPING");
          setEndingIndex((prevIndex) =>
            prevIndex >= HEADING_TEXT.endings.length - 1 ? 0 : prevIndex + 1
          );
        }
        break;
    }
  }, [endingIndex, headingText, typingState]);

  return (
    <HomeSection>
      <h2 className="home__h1 home__h1--animated">
        Are we lying to you? <span>{headingText}</span>
        <BlinkingCursor />
      </h2>
      <p className="home__body home__body--center">Click one to see</p>
      <div className="home__social-container">
        <a href="/foundation/presidential-debate-clinton-trump-1-of-3/~cut:(2879,2891.639892578125),fact:E74aoUY=887eb256a26aa4be39a9d849804b8e6e418222ae,kind:videoCut">
          {props.leftSocial}
        </a>
        <a href="/foundation/presidential-debate-clinton-trump-1-of-3/~cut:(2689.89990234375,2702.360107421875),fact:E74aoUY=887eb256a26aa4be39a9d849804b8e6e418222ae,kind:videoCut">
          {props.rightSocial}
        </a>
      </div>
      <h2 className="home__h1 home__h1--center">
        Don't let someone else decide&nbsp;for&nbsp;you
      </h2>
      <p className="home__body home__body--center">
        We're not tracking what you've said.
        We're&nbsp;not&nbsp;selling&nbsp;your&nbsp;attention.
      </p>
    </HomeSection>
  );
};

export default WhatIsThis;
