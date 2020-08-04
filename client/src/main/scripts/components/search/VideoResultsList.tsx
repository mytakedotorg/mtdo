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
import VideoLite from "../VideoLite";
import VideoPlaceholder from "../VideoPlaceholder";
import NGramViewer from "./NGramViewer";
import { SearchMode, SearchResult } from "./search";
import SearchRadioButtons from "./SearchRadioButtons";
import VideoResult from "./VideoResult";

interface VideoResultsListProps {
  mode: SearchMode;
  searchResult: SearchResult;
  onModeChange(mode: SearchMode): void;
}

interface VideoResultsListState {
  fixVideo: boolean;
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
    const { factHits } = props.searchResult;
    this.state = {
      fixVideo: false,
      videoProps: factHits.length
        ? {
            videoId: factHits[0].videoFact.youtubeId,
          }
        : undefined,
    };
  }
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
    const { mode, onModeChange, searchResult } = this.props;
    const { factHits, searchQuery } = searchResult;
    const fixedClass = this.state.fixVideo ? "results__push" : "";
    return (
      <div className="results">
        <div className="results__inner-container">
          <h1 className="results__heading">Search Results</h1>
          {factHits.length === 0 ? (
            <p className="turn__results">
              Search returned no results for <strong>{searchQuery}</strong>
            </p>
          ) : (
            <div>
              <NGramViewer searchResult={searchResult} />
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
                  onChange={onModeChange}
                  selectedOption={mode}
                />
              </div>
            </div>
          )}
          {factHits.map((f) => {
            const results = f.searchHits.map((h) => {
              return (
                <VideoResult
                  key={getUniqueKey(
                    f.videoFact.youtubeId,
                    h.turn,
                    h.hitOffsets
                  )}
                  onPlayClick={this.handlePlayClick}
                  searchHit={h}
                />
              );
            });
            return results.length > 0 ? (
              <div className="results__preview">
                <h2 className="results__subheading">
                  {f.videoFact.fact.title} - {f.videoFact.fact.primaryDate}
                </h2>
                {results}
              </div>
            ) : null;
          })}
        </div>
      </div>
    );
  }
}

const getUniqueKey = (
  youtubeId: string,
  turn: number,
  hitOffsets: [number, number]
): string => {
  return `${youtubeId}.${turn}.${hitOffsets[0]}.${hitOffsets[1]}`;
};

export default VideoResultsList;
