import * as React from "react";
import SearchRadioButtons from "./SearchRadioButtons";
import VideoLite, { VideoLiteProps } from "./VideoLite";
import VideoPlaceholder from "./VideoPlaceholder";
import VideoFactsLoader from "./VideoFactsLoader";
import { VideoResultPreviewEventHandlers } from "./VideoResultPreview";
import isEqual = require("lodash/isEqual");
import { alertErr } from "../utils/functions";
import { Search } from "../java2ts/Search";
import { Foundation } from "../java2ts/Foundation";

export type SelectionOptions = "Containing" | "BeforeAndAfter";

export interface SortedResults {
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
  sortedList: SortedResults[];
  videoProps?: {
    videoId: string;
    clipRange?: [number, number];
  };
}

class VideoResultsList extends React.Component<
  VideoResultsListProps,
  VideoResultsListState
> {
  private maxResults: number;
  constructor(props: VideoResultsListProps) {
    super(props);

    this.maxResults = 50;

    this.state = {
      fixVideo: false,
      selectedOption: "Containing",
      sortedList: this.sortResults(props.results)
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
  sortResults = (results: Search.FactResultList): SortedResults[] => {
    const sortedByHash: Search.VideoResult[] = results.facts.concat().sort();
    if (sortedByHash.length > 0) {
      let sortedResults: SortedResults[] = [];
      let prevHash = sortedByHash[0].hash;
      let turns: number[] = [];
      for (const videoResult of sortedByHash) {
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
  componentWillReceiveProps(nextProps: VideoResultsListProps) {
    if (!isEqual(this.props.results, nextProps.results)) {
      this.setState({
        sortedList: this.sortResults(nextProps.results)
      });
    }
  }
  render() {
    const fixedClass = this.state.fixVideo ? "results__push" : "";
    return (
      <div className="results">
        <div className="results__inner-container">
          <h1 className="results__heading">Search Results</h1>
          {this.state.sortedList.length === 0 ? (
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
          {this.state.sortedList
            // .slice(0, this.maxResults)
            .map((videoResult, idx) => {
              const eventHandlers: VideoResultPreviewEventHandlers = {
                onPlayClick: this.handlePlayClick
              };
              if (idx === 0) {
                eventHandlers.onReady = this.handleReady;
              }
              return (
                <VideoFactsLoader
                  key={idx.toString()}
                  eventHandlers={eventHandlers}
                  results={videoResult}
                  searchTerm={this.props.searchTerm}
                  sortBy={this.state.selectedOption}
                />
              );
            })}
        </div>
      </div>
    );
  }
}

export default VideoResultsList;
