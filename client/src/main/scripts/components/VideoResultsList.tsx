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
import SearchRadioButtons from "./SearchRadioButtons";
import VideoLite, { VideoLiteProps } from "./VideoLite";
import VideoPlaceholder from "./VideoPlaceholder";
import VideoResultPreview from "./VideoResultPreview";
import { VideoResultPreviewEventHandlers } from "./VideoResultPreview";
import isEqual = require("lodash/isEqual");
import {
  fetchFactReturningPromise,
  VideoFactHashMap
} from "../utils/databaseAPI";
import { alertErr } from "../utils/functions";
import { Search } from "../java2ts/Search";
import { Foundation } from "../java2ts/Foundation";
import { Promise } from "es6-promise";

export type SelectionOptions = "Containing" | "BeforeAndAfter";

export interface FactTurns {
  videoFact: Foundation.VideoFactContent;
  turns: number[];
}

interface SortedResults {
  hash: string;
  turns: number[];
}

interface VideoResultsListProps {
  results: Search.FactResultList;
  searchTerm: string;
}

interface VideoResultsListState {
  fixVideo: boolean;
  selectedOption: SelectionOptions;
  factTurns: FactTurns[];
  videoProps?: {
    videoId: string;
    clipRange?: [number, number];
  };
}

class VideoResultsList extends React.Component<
  VideoResultsListProps,
  VideoResultsListState
> {
  private sortedResults: SortedResults[];
  constructor(props: VideoResultsListProps) {
    super(props);

    this.sortedResults = this.sortResults(props.results);

    this.state = {
      fixVideo: false,
      selectedOption: "Containing",
      factTurns: []
    };
  }
  handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    if (value === "Containing" || value === "BeforeAndAfter") {
      if (value !== this.state.selectedOption) {
        this.setState({
          selectedOption: value
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
        clipRange: clipRange
      }
    });
  };
  handleReady = (youtubeId: string) => {
    this.setState({
      videoProps: {
        videoId: youtubeId
      }
    });
  };
  handleScroll = (fixVideo: boolean) => {
    if (this.state.fixVideo != fixVideo) {
      this.setState({
        fixVideo: fixVideo
      });
    }
  };
  fetchFacts = (): any => {
    const promises = [];
    for (const result of this.sortedResults) {
      promises.push(fetchFactReturningPromise(result.hash));
    }

    Promise.all(promises).then(this.processFacts.bind(this));
  };
  processFacts(json: VideoFactHashMap[]) {
    let factTurnsArr: FactTurns[] = [];
    for (const videoFact of json) {
      const currentHash = videoFact.hash;
      const reducer = this.sortedResults.reduce(
        (accumulator: SortedResults, currentValue: SortedResults) => {
          if (accumulator.hash !== currentHash) {
            // Skip accumulating until we match our hash
            return currentValue;
          }
          if (currentValue.hash === currentHash) {
            return {
              hash: currentHash,
              turns: accumulator.turns.concat(currentValue.turns)
            };
          } else {
            return accumulator;
          }
        }
      );
      factTurnsArr.push({
        turns: reducer.turns,
        videoFact: videoFact.videoFact
      });
    }
    this.setState({
      factTurns: factTurnsArr
    });
  }
  sortResults = (results: Search.FactResultList): SortedResults[] => {
    const facts: Search.VideoResult[] = results.facts;
    if (facts.length > 0) {
      let sortedResults: SortedResults[] = [];
      let prevHash = facts[0].hash;
      let turns: number[] = [];
      for (const videoResult of facts) {
        if (videoResult.hash !== prevHash) {
          sortedResults.push({
            hash: prevHash,
            turns: turns
          });
          prevHash = videoResult.hash;
          turns = [videoResult.turn];
        } else {
          turns.push(videoResult.turn);
        }
      }
      // Push last hash after loop is over
      sortedResults.push({
        hash: prevHash,
        turns: turns
      });
      return sortedResults;
    } else {
      return [];
    }
  };
  componentDidMount() {
    this.fetchFacts();
  }
  componentWillReceiveProps(nextProps: VideoResultsListProps) {
    if (!isEqual(this.props.results, nextProps.results)) {
      this.sortedResults = this.sortResults(nextProps.results);
      this.fetchFacts();
    }
  }
  render() {
    const fixedClass = this.state.fixVideo ? "results__push" : "";
    return (
      <div className="results">
        <div className="results__inner-container">
          <h1 className="results__heading">Search Results</h1>
          {this.state.factTurns.length === 0 ? (
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
          {this.state.factTurns.map((videoResult, idx) => {
            const eventHandlers: VideoResultPreviewEventHandlers = {
              onPlayClick: this.handlePlayClick
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
