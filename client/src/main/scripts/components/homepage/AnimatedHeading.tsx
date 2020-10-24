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
  start: "When was ",
  middles: HOMEPAGE_SEARCHES,
  end: "said in a debate?",
};
const TYPING_DELAY = 100;
const STATIC_DELAY = 5000;
const DELETING_DELAY = 10;

interface AnimatedHeadingProps {
  onFinishTyping(text: string): void;
}

const AnimatedHeading: React.FC<AnimatedHeadingProps> = (props) => {
  const [headingText, setHeadingText] = useState("");
  const [middleIndex, setMiddleIndex] = useState(0);
  const [typingState, setTypingState] = useState<TypingState>("TYPING");

  const continueTyping = (currentEndingIndex: number) => {
    setTimeout(() => {
      setHeadingText((prevText) =>
        HEADING_TEXT.middles[currentEndingIndex].substr(0, prevText.length + 1)
      );
    }, TYPING_DELAY);
  };

  const continueDeleting = (currentEndingIndex: number) => {
    setTimeout(() => {
      setHeadingText((prevText) =>
        HEADING_TEXT.middles[currentEndingIndex].substr(0, prevText.length - 1)
      );
    }, DELETING_DELAY);
  };

  useEffect(() => {
    switch (typingState) {
      case "TYPING":
        if (headingText !== HEADING_TEXT.middles[middleIndex]) {
          continueTyping(middleIndex);
        } else {
          setTypingState("STATIC");
        }
        break;
      case "STATIC":
        props.onFinishTyping(HEADING_TEXT.middles[middleIndex]);
        setTimeout(() => {
          setTypingState("DELETING");
        }, STATIC_DELAY);
        break;
      case "DELETING":
        if (headingText !== "") {
          continueDeleting(middleIndex);
        } else {
          setTypingState("TYPING");
          setMiddleIndex((prevIndex) =>
            prevIndex >= HEADING_TEXT.middles.length - 1 ? 0 : prevIndex + 1
          );
        }
        break;
    }
  }, [middleIndex, headingText, typingState]);

  return (
    <p>
      {HEADING_TEXT.start}
      {headingText}
      <BlinkingCursor />
      {HEADING_TEXT.end}
    </p>
  );
};

export default AnimatedHeading;
