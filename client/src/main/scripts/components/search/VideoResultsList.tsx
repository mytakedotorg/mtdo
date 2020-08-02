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
import { FT } from "../../java2ts/FT";
import { alertErr } from "../../utils/functions";
import VideoLite from "../VideoLite";
import VideoPlaceholder from "../VideoPlaceholder";
import { SearchResult } from "./database/SearchDatabaseApi";
import SearchRadioButtons from "./SearchRadioButtons";
import VideoResultPreview, {
  VideoResultPreviewEventHandlers,
} from "./VideoResultPreview";

export type SelectionOptions = "Containing" | "BeforeAndAfter";

interface VideoResultsListProps {
  searchResult: SearchResult;
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
    const { factTurns } = props.searchResult;
    this.state = {
      fixVideo: false,
      selectedOption: "BeforeAndAfter",
      videoProps: factTurns.length
        ? {
            videoId: factTurns[0].videoFact.youtubeId,
          }
        : undefined,
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
    videoFact: FT.VideoFactContent,
    clipRange: [number, number]
  ) => {
    this.setState({
      videoProps: {
        videoId: videoFact.youtubeId,
        clipRange: clipRange,
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
    const { factTurns, searchQuery } = this.props.searchResult;
    const fixedClass = this.state.fixVideo ? "results__push" : "";
    resultPreviewEventHandlers.onPlayClick = this.handlePlayClick;
    return (
      <div className="results">
        <div className="results__inner-container">
          <h1 className="results__heading">Search Results</h1>
          {factTurns.length === 0 ? (
            <p className="turn__results">
              Search returned no results for <strong>{searchQuery}</strong>
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
          {factTurns.map((v) => {
            return (
              <VideoResultPreview
                key={v.videoFact.youtubeId}
                eventHandlers={resultPreviewEventHandlers}
                searchQuery={searchQuery}
                sortBy={this.state.selectedOption}
                turns={v.turns}
                videoFact={v.videoFact}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

/**
 * This object is created in root file scope so that it isn't
 * re-created every render cycle. If it is re-created, then child
 * components will re-render unnecessarily.
 */
let resultPreviewEventHandlers: VideoResultPreviewEventHandlers = {
  onPlayClick: () => {},
};

export default VideoResultsList;
