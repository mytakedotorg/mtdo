import * as React from "react";
import SearchRadioButtons from "./SearchRadioButtons";
import VideoLite, { VideoLiteProps } from "./VideoLite";
import VideoPlaceholder from "./VideoPlaceholder";
import { VideoFactsLoader } from "./VideoResultsLoader";
import isEqual = require("lodash/isEqual");
import { alertErr } from "../utils/functions";
import { Search } from "../java2ts/Search";
import { Foundation } from "../java2ts/Foundation";

export type SelectionOptions = "Containing" | "BeforeAndAfter";

export interface SortedResults {
  hash: string;
  turns: number[];
}

interface VideoResultsProps {
  results: Search.FactResultList;
}

interface VideoResultsState {
  selectedOption: SelectionOptions;
  sortedList: SortedResults[];
  videoProps?: VideoLiteProps;
}

class VideoResults extends React.Component<
  VideoResultsProps,
  VideoResultsState
> {
  maxResults: number;
  constructor(props: VideoResultsProps) {
    super(props);

    this.maxResults = 50;

    this.state = {
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
  sortResults = (results: Search.FactResultList): SortedResults[] => {
    // We'll need different compare functions depending on the filter
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
          turns = [];
        }
        turns.push(videoResult.turn);
      }
      return sortedResults;
    } else {
      return [];
    }
  };
  componentWillReceiveProps(nextProps: VideoResultsProps) {
    if (!isEqual(this.props.results, nextProps.results)) {
      this.setState({
        sortedList: this.sortResults(nextProps.results)
      });
    }
  }
  render() {
    return (
      <div className="results">
        <div className="results__inner-container">
          <h1 className="results__heading">Search Results</h1>
          {this.state.videoProps ? (
            <VideoLite {...this.state.videoProps} />
          ) : (
            <VideoPlaceholder />
          )}
          <SearchRadioButtons
            onChange={this.handleChange}
            selectedOption={this.state.selectedOption}
          />
          {this.state.sortedList
            // .slice(0, this.maxResults)
            .map((videoResult, idx) => {
              return <VideoFactsLoader results={videoResult} />;
            })}
        </div>
      </div>
    );
  }
}

interface VideoResultPreviewProps {
  turns: number[];
  videoFact: Foundation.VideoFactContent;
}
interface VideoResultPreviewState {}

export class VideoResultPreview extends React.Component<
  VideoResultPreviewProps,
  VideoResultPreviewState
> {
  constructor(props: VideoResultPreviewProps) {
    super(props);
  }
  render() {
    const { turns, videoFact } = this.props;
    return (
      <div className="results__preview">
        <h2>
          Presidential debate | {videoFact.fact.title} -{" "}
          {videoFact.fact.primaryDate}
        </h2>
        {turns.map(turn => {
          let snippet;
          const firstChar = videoFact.charOffsets[turn];
          if (videoFact.speakerWord[turn + 1]) {
            const lastChar = videoFact.charOffsets[turn + 1] - 1;
            snippet = videoFact.plainText.substring(firstChar, lastChar);
          } else {
            // Result is in last turn
            snippet = videoFact.plainText.substring(firstChar);
          }
          return <p>{snippet}</p>;
        })}
      </div>
    );
  }
}

interface VideoResultTurnsProps {}
interface VideoResultTurnsState {}
class VideoResultTurn extends React.Component<
  VideoResultTurnsProps,
  VideoResultTurnsState
> {
  constructor(props: VideoResultTurnsProps) {
    super(props);
  }
  render() {
    return <div className="results__turn" />;
  }
}
export default VideoResults;
