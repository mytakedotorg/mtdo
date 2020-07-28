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
import React from "react";
import VideoResult, { PlayEvent } from "./VideoResult";
import { SelectionOptions } from "./VideoResultsList";
import { Foundation } from "../java2ts/Foundation";
import { MultiHighlight, TurnFinder } from "../utils/searchFunc";
import { alertErr } from "../utils/functions";

export interface VideoResultPreviewEventHandlers {
  onPlayClick: PlayEvent;
}

interface VideoResultPreviewProps {
  eventHandlers: VideoResultPreviewEventHandlers;
  searchTerm: string;
  sortBy: SelectionOptions;
  turns: number[];
  videoFact: Foundation.VideoFactContent;
}

const VideoResultPreview: React.FC<VideoResultPreviewProps> = (props) => {
  const { searchTerm, sortBy, turns, videoFact } = props;
  let allVideoResults: JSX.Element[] = [];
  turns.forEach((turn) => {
    const turnContent = getTurnContent(turn, videoFact);
    const multiHighlights = getMultiHighlights(searchTerm, sortBy, turnContent);
    const videoResults = multiHighlights.map((multiHighlight) => {
      return (
        <VideoResult
          key={getUniqueKey(turn, multiHighlight)}
          multiHighlight={multiHighlight}
          onPlayClick={props.eventHandlers.onPlayClick}
          sortBy={props.sortBy}
          turn={turn}
          turnContent={turnContent}
          videoFact={props.videoFact}
        />
      );
    });
    allVideoResults = allVideoResults.concat(videoResults);
  });
  return allVideoResults.length > 0 ? (
    <div className="results__preview">
      <h2 className="results__subheading">
        {videoFact.fact.title} - {videoFact.fact.primaryDate}
      </h2>
      {allVideoResults}
    </div>
  ) : null;
};

const getTurnContent = (
  turn: number,
  videoFact: Foundation.VideoFactContent
): string => {
  let fullTurnText;
  const firstWord = videoFact.speakerWord[turn];
  const firstChar = videoFact.charOffsets[firstWord];

  if (videoFact.speakerWord[turn + 1]) {
    const lastWord = videoFact.speakerWord[turn + 1];
    const lastChar = videoFact.charOffsets[lastWord] - 1;
    fullTurnText = videoFact.plainText.substring(firstChar, lastChar);
  } else {
    // Result is in last turn
    fullTurnText = videoFact.plainText.substring(firstChar);
  }
  return fullTurnText;
};

const getMultiHighlights = (
  searchTerm: string,
  sortBy: SelectionOptions,
  turnContent: string
): MultiHighlight[] => {
  const turnFinder = new TurnFinder(searchTerm);
  const turnWithResults = turnFinder.findResults(turnContent);
  if (sortBy === "Containing") {
    return turnWithResults.expandBy(1);
  } else if (sortBy === "BeforeAndAfter") {
    return turnWithResults.expandBy(2);
  } else {
    const msg = "VideoResultTurn: Unknown radio selection";
    alertErr(msg);
    throw msg;
  }
};

const getUniqueKey = (turn: number, { cut }: MultiHighlight): string => {
  return `${turn}.${cut[0]}.${cut[1]}`;
};

export default VideoResultPreview;
