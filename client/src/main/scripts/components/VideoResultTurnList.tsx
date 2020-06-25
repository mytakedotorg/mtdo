/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
import VideoResult, { PlayEvent } from "./VideoResult";
import { SelectionOptions } from "./VideoResultsList";
import { Foundation } from "../java2ts/Foundation";
import { alertErr } from "../utils/functions";
import { MultiHighlight, TurnFinder } from "../utils/searchFunc";
import isEqual = require("lodash/isEqual");

interface VideoResultTurnListProps {
  searchTerm: string;
  sortBy: SelectionOptions;
  turn: number;
  videoFact: Foundation.VideoFactContent;
  onPlayClick: PlayEvent;
}
interface VideoResultTurnListState {
  multiHighlights: MultiHighlight[];
  turnContent: string;
}

class VideoResultTurnList extends React.Component<
  VideoResultTurnListProps,
  VideoResultTurnListState
> {
  constructor(props: VideoResultTurnListProps) {
    super(props);

    const turnContent: string = this.getTurnContent(props);

    this.state = {
      multiHighlights: this.getMultiHighlights(props, turnContent),
      turnContent: turnContent
    };
  }
  getMultiHighlights = (
    props: VideoResultTurnListProps,
    turnContent: string
  ): MultiHighlight[] => {
    const turnFinder = new TurnFinder(props.searchTerm);
    const turnWithResults = turnFinder.findResults(turnContent);
    if (props.sortBy === "Containing") {
      return turnWithResults.expandBy(1);
    } else if (props.sortBy === "BeforeAndAfter") {
      return turnWithResults.expandBy(2);
    } else {
      const msg = "VideoResultTurn: Unknown radio selection";
      alertErr(msg);
      throw msg;
    }
  };
  getTurnContent = (props: VideoResultTurnListProps): string => {
    const { searchTerm, turn, videoFact } = props;
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
  componentWillReceiveProps(nextProps: VideoResultTurnListProps) {
    if (!isEqual(this.props, nextProps)) {
      const turnContent: string = this.getTurnContent(nextProps);
      this.setState({
        multiHighlights: this.getMultiHighlights(nextProps, turnContent),
        turnContent: turnContent
      });
    }
  }
  render() {
    return (
      <div>
        {this.state.multiHighlights.map(
          (multiHighlight: MultiHighlight, idx: number) => {
            return (
              <VideoResult
                key={idx.toString()}
                multiHighlight={multiHighlight}
                onPlayClick={this.props.onPlayClick}
                sortBy={this.props.sortBy}
                turn={this.props.turn}
                turnContent={this.state.turnContent}
                videoFact={this.props.videoFact}
              />
            );
          }
        )}
      </div>
    );
  }
}

export default VideoResultTurnList;
