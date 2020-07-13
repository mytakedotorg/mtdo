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
import SearchRadioButtons from "./SearchRadioButtons";
import VideoLite from "./VideoLite";
import VideoPlaceholder from "./VideoPlaceholder";
import VideoResultPreview from "./VideoResultPreview";
import { VideoResultPreviewEventHandlers } from "./VideoResultPreview";
import { alertErr } from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";

import { FactTurns } from "../utils/factResults";

export type SelectionOptions = "Containing" | "BeforeAndAfter";

export interface VideoResultsListProps {
  searchTerm: string;
  factTurns: FactTurns[];
}

interface VideoResultsListState {
  fixVideo: boolean;
  selectedOption: SelectionOptions;
  videoProps?: {
    videoId: string;
    clipRange?: [number, number];
  };
}

export class VideoResultsList extends React.Component<
  VideoResultsListProps,
  VideoResultsListState
> {
  constructor(props: VideoResultsListProps) {
    super(props);

    this.state = {
      fixVideo: false,
      selectedOption: "Containing",
    };
  }
  handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    if (value === "Containing" || value === "BeforeAndAfter") {
      if (value !== this.state.selectedOption) {
        this.setState({
          selectedOption: value,
        });
      }
    } else {
      const msg = "VideoResults: Unknown radio button";
      alertErr(msg);
      throw msg;
    }
  };
  handlePlayClick = (
    videoFact: Foundation.VideoFactContent,
    clipRange: [number, number]
  ) => {
    this.setState({
      videoProps: {
        videoId: videoFact.youtubeId,
        clipRange: clipRange,
      },
    });
  };
  handleReady = (youtubeId: string) => {
    this.setState({
      videoProps: {
        videoId: youtubeId,
      },
    });
  };
  handleScroll = (fixVideo: boolean) => {
    if (this.state.fixVideo != fixVideo) {
      this.setState({
        fixVideo: fixVideo,
      });
    }
  };
  render() {
    const fixedClass = this.state.fixVideo ? "results__push" : "";
    return (
      <div className="results">
        <div className="results__inner-container">
          <h1 className="results__heading">Search Results</h1>
          {this.props.factTurns.length === 0 ? (
            <p className="turn__results">
              Search returned no results for{" "}
              <strong>{this.props.searchTerm}</strong>
            </p>
          ) : (
            <div>
              {this.state.videoProps ? (
                <VideoLite
                  {...this.state.videoProps}
                  onScroll={this.handleScroll}
                  isFixed={this.state.fixVideo}
                />
              ) : (
                <VideoPlaceholder />
              )}
              <div className={fixedClass}>
                <SearchRadioButtons
                  onChange={this.handleChange}
                  selectedOption={this.state.selectedOption}
                />
              </div>
            </div>
          )}
          {this.props.factTurns.map((videoResult, idx) => {
            const eventHandlers: VideoResultPreviewEventHandlers = {
              onPlayClick: this.handlePlayClick,
            };
            if (idx === 0) {
              eventHandlers.onReady = this.handleReady;
            }
            return (
              <VideoResultPreview
                key={idx.toString()}
                eventHandlers={eventHandlers}
                searchTerm={this.props.searchTerm}
                sortBy={this.state.selectedOption}
                turns={videoResult.turns}
                videoFact={videoResult.videoFact}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default VideoResultsList;
