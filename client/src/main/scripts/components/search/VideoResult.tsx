/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
import * as React from "react";
import { Foundation } from "../../java2ts/Foundation";
import { SelectionOptions } from "./VideoResultsList";
import { convertSecondsToTimestamp, slugify } from "../../utils/functions";
import { MultiHighlight } from "./searchUtils";
import { Routes } from "../../java2ts/Routes";
var bs = require("binary-search");

export type PlayEvent = (
  videoFact: Foundation.VideoFactContent,
  clipRange: [number, number]
) => any;

interface VideoResultProps {
  multiHighlight: MultiHighlight;
  turn: number;
  turnContent: string;
  sortBy: SelectionOptions;
  videoFact: Foundation.VideoFactContent;
  onPlayClick: PlayEvent;
}
interface VideoResultState {}
class VideoResult extends React.Component<VideoResultProps, VideoResultState> {
  clipRange: [number, number];
  constructor(props: VideoResultProps) {
    super(props);

    this.clipRange = this.getClipTimeRange(props.multiHighlight);
  }
  getCut = (): string => {
    const { turnContent, multiHighlight } = this.props;
    const cutRange = multiHighlight.cut;
    return turnContent.substring(cutRange[0], cutRange[1]);
  };
  getSpeaker = (props: VideoResultProps): string => {
    const { turn, videoFact } = props;
    const fullName = videoFact.speakers[videoFact.speakerPerson[turn]].fullName;
    return fullName.substring(fullName.lastIndexOf(" "));
  };
  getTime = (): string => {
    return (
      convertSecondsToTimestamp(this.clipRange[0]) +
      " - " +
      convertSecondsToTimestamp(this.clipRange[1])
    );
  };
  getClipTimeRange = (multiHighlight: MultiHighlight): [number, number] => {
    const { turn, videoFact } = this.props;
    const veryFirstWord = videoFact.speakerWord[turn];
    const firstChar = videoFact.charOffsets[veryFirstWord];
    const charsBeforeTurn = this.props.videoFact.charOffsets[this.props.turn];
    let firstWord = bs(
      this.props.videoFact.charOffsets, // haystack
      firstChar + multiHighlight.cut[0], // needle
      (element: number, needle: number) => {
        return element - needle;
      }
    );

    // usually the timestamp is between two words, in which case it returns (-insertionPoint - 2)
    if (firstWord < 0) {
      firstWord = -firstWord - 2;
    }

    const clipStart = this.props.videoFact.timestamps[firstWord];

    let lastWord = bs(
      this.props.videoFact.charOffsets, // haystack
      firstChar + multiHighlight.cut[1], // needle
      (element: number, needle: number) => {
        return element - needle;
      }
    );

    // usually the timestamp is between two words, in which case it returns (-insertionPoint - 2)
    if (lastWord < 0) {
      lastWord = -lastWord - 2;
    }

    let clipEnd;
    if (this.props.videoFact.timestamps[lastWord + 1]) {
      clipEnd = this.props.videoFact.timestamps[lastWord + 1];
    } else {
      clipEnd = this.props.videoFact.timestamps[lastWord] + 2;
    }

    return [clipStart, clipEnd];
  };
  handlePlayClick = () => {
    this.props.onPlayClick(this.props.videoFact, this.clipRange);
  };
  handleOpenClick = () => {
    window.location.href =
      Routes.FOUNDATION_V1 +
      "/" +
      slugify(this.props.videoFact.fact.title) +
      "/" +
      this.clipRange[0].toFixed(3) +
      "-" +
      this.clipRange[1].toFixed(3);
  };
  highlightCut = (multiHighlight: MultiHighlight): React.ReactNode => {
    const { turnContent } = this.props;
    const highlightedCut: React.ReactNode[] = [];
    let prevIndex = multiHighlight.cut[0];
    for (const highlight of multiHighlight.highlights) {
      const textBefore = turnContent.substring(prevIndex, highlight[0]);
      const highlightedText = turnContent.substring(highlight[0], highlight[1]);
      if (textBefore) {
        highlightedCut.push(textBefore);
      }
      if (highlightedText) {
        const newSpan: React.ReactNode = React.createElement(
          "strong",
          { key: `${highlight[0]}.${highlight[1]}` },
          highlightedText
        );
        highlightedCut.push(newSpan);
      }
      prevIndex = highlight[1];
    }
    const textAfter = turnContent.substring(prevIndex, multiHighlight.cut[1]);
    highlightedCut.push(textAfter);

    return highlightedCut;
  };
  componentWillReceiveProps(nextProps: VideoResultProps) {
    if (nextProps.sortBy !== this.props.sortBy) {
      this.clipRange = this.getClipTimeRange(nextProps.multiHighlight);
    }
  }
  render() {
    return (
      <div className="turn">
        <div className="turn__info">
          <h3 className="turn__speaker">{this.getSpeaker(this.props)}</h3>
          <p className="turn__time">{this.getTime()}</p>
          <div className="turn__actions">
            <button
              className="turn__button turn__button--play"
              onClick={this.handlePlayClick}
            >
              Play
            </button>
            <button
              className="turn__button turn__button--open"
              onClick={this.handleOpenClick}
            >
              Open
            </button>
          </div>
        </div>
        <p className="turn__results">
          {this.highlightCut(this.props.multiHighlight)}
        </p>
      </div>
    );
  }
}

export default VideoResult;
