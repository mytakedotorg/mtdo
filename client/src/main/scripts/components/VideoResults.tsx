import * as React from "react";
import SearchRadioButtons from "./SearchRadioButtons";
import VideoLite, { VideoLiteProps } from "./VideoLite";
import VideoPlaceholder from "./VideoPlaceholder";
import { VideoFactsLoader } from "./VideoResultsLoader";
import isEqual = require("lodash/isEqual");
import { alertErr, convertSecondsToTimestamp } from "../utils/functions";
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
  selectedOption: SelectionOptions;
  sortedList: SortedResults[];
  videoProps?: VideoLiteProps;
}

class VideoResultsList extends React.Component<
  VideoResultsListProps,
  VideoResultsListState
> {
  maxResults: number;
  constructor(props: VideoResultsListProps) {
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
              return (
                <VideoFactsLoader
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

interface VideoResultPreviewProps {
  searchTerm: string;
  sortBy: SelectionOptions;
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
    const { searchTerm, sortBy, turns, videoFact } = this.props;
    return (
      <div className="results__preview">
        <h2 className="results__subheading">
          Presidential debate | {videoFact.fact.title} -{" "}
          {videoFact.fact.primaryDate}
        </h2>
        {turns.map(turn => {
          return (
            <VideoResultTurn
              searchTerm={searchTerm}
              sortBy={sortBy}
              turn={turn}
              videoFact={videoFact}
            />
          );
        })}
      </div>
    );
  }
}

interface VideoResultTurnsProps {
  searchTerm: string;
  sortBy: SelectionOptions;
  turn: number;
  videoFact: Foundation.VideoFactContent;
}
interface VideoResultTurnsState {
  sentences: string[];
  speaker: string;
  time: number;
}
class VideoResultTurn extends React.Component<
  VideoResultTurnsProps,
  VideoResultTurnsState
> {
  constructor(props: VideoResultTurnsProps) {
    super(props);

    this.state = {
      sentences: this.getSentences(this.props),
      speaker: this.getSpeaker(this.props),
      time: this.getTime(this.props)
    };
  }
  getSentences = (props: VideoResultTurnsProps): string[] => {
    const { searchTerm, turn, videoFact } = props;
    let fullTurnText;
    const firstWord = videoFact.speakerWord[turn];
    const firstChar = videoFact.charOffsets[firstWord];
    if (videoFact.speakerWord[turn + 1]) {
      const lastWord = videoFact.speakerWord[turn + 1] - 1;
      const lastChar = videoFact.charOffsets[lastWord];
      fullTurnText = videoFact.plainText.substring(firstChar, lastChar);
    } else {
      // Result is in last turn
      fullTurnText = videoFact.plainText.substring(firstChar);
    }
    const intoSentences = fullTurnText.split(".");
    const sentences: string[] = [];
    switch (props.sortBy) {
      case "Containing":
        for (const sentence of intoSentences) {
          if (sentence.toLowerCase().includes(searchTerm.toLowerCase())) {
            sentences.push(sentence + ".");
          }
        }
        break;
      case "BeforeAndAfter":
        for (let i = 0; i < intoSentences.length; i++) {
          const sentence = intoSentences[i];
          if (sentence.toLowerCase().includes(searchTerm.toLowerCase())) {
            let allSentences = "";
            if (intoSentences[i - 1]) {
              allSentences = intoSentences[i - 1] + ". ";
            }
            allSentences += intoSentences[i] + ". ";
            if (intoSentences[i + 1]) {
              allSentences += intoSentences[i + 1] + ". ";
            }
            sentences.push(allSentences);
          }
        }
        break;
      default:
        const msg = "VideoResultPreview: Unexpected radio button option";
        alertErr(msg);
        throw msg;
    }
    return sentences;
  };
  getSpeaker = (props: VideoResultTurnsProps): string => {
    const { turn, videoFact } = props;
    return videoFact.speakers[videoFact.speakerPerson[turn]].lastname;
  };
  getTime = (props: VideoResultTurnsProps): number => {
    const { turn, videoFact } = props;
    return videoFact.timestamps[videoFact.speakerWord[turn]];
  };
  componentWillReceiveProps(nextProps: VideoResultTurnsProps) {
    if (!isEqual(this.props, nextProps)) {
      this.setState({
        sentences: this.getSentences(nextProps),
        speaker: this.getSpeaker(nextProps),
        time: this.getTime(nextProps)
      });
    }
  }
  render() {
    return (
      <VideoResult
        duration={this.props.videoFact.durationSeconds}
        sentences={this.state.sentences}
        speaker={this.state.speaker}
        time={this.state.time}
      />
    );
  }
}

interface VideoResultProps {
  duration: number;
  time: number;
  speaker: string;
  sentences: string[];
}
interface VideoResultState {}
class VideoResult extends React.Component<VideoResultProps, VideoResultState> {
  constructor(props: VideoResultProps) {
    super(props);
  }
  render() {
    return (
      <div>
        {this.props.sentences.map(sentence => {
          return (
            <div className="results__turn">
              <p className="results__text">{this.props.speaker}</p>
              <p className="results__text">
                @{convertSecondsToTimestamp(this.props.time)}/{convertSecondsToTimestamp(
                  this.props.duration
                )}
              </p>
              <p className="results__text">{sentence}</p>
            </div>
          );
        })}
      </div>
    );
  }
}

export default VideoResultsList;
