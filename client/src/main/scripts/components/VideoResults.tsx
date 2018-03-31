import * as React from "react";
import SearchRadioButtons from "./SearchRadioButtons";
import VideoLite, { VideoLiteProps } from "./VideoLite";
import VideoPlaceholder from "./VideoPlaceholder";
import VideoFactsLoader from "./VideoFactsLoader";
import isEqual = require("lodash/isEqual");
import {
  alertErr,
  convertSecondsToTimestamp,
  slugify
} from "../utils/functions";
import {
  MultiHighlight,
  TurnFinder,
  TurnWithResults
} from "../utils/searchFunc";
import { Search } from "../java2ts/Search";
import { Routes } from "../java2ts/Routes";
import { Foundation } from "../java2ts/Foundation";
var bs = require("binary-search");

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
  handlePlayClick = (
    videoFact: Foundation.VideoFactContent,
    clipRange: [number, number]
  ) => {
    this.setState({
      videoProps: {
        videoFact: videoFact,
        clipRange: clipRange
      }
    });
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
          {this.state.sortedList.length === 0 ? (
            <p className="turn__results">
              Search returned no results for{" "}
              <strong>{this.props.searchTerm}</strong>
            </p>
          ) : (
            <SearchRadioButtons
              onChange={this.handleChange}
              selectedOption={this.state.selectedOption}
            />
          )}
          {this.state.sortedList
            // .slice(0, this.maxResults)
            .map((videoResult, idx) => {
              return (
                <VideoFactsLoader
                  key={idx.toString()}
                  onPlayClick={this.handlePlayClick}
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
  onPlayClick: PlayEvent;
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
        {turns.map((turn, idx) => {
          return (
            <VideoResultTurn
              key={idx.toString()}
              onPlayClick={this.props.onPlayClick}
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
  onPlayClick: PlayEvent;
}
interface VideoResultTurnsState {
  multiHighlights: MultiHighlight[];
  turnContent: string;
}

class VideoResultTurn extends React.Component<
  VideoResultTurnsProps,
  VideoResultTurnsState
> {
  constructor(props: VideoResultTurnsProps) {
    super(props);

    const turnContent: string = this.getTurnContent(props);

    this.state = {
      multiHighlights: this.getMultiHighlights(props, turnContent),
      turnContent: turnContent
    };
  }
  getMultiHighlights = (
    props: VideoResultTurnsProps,
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
  getTurnContent = (props: VideoResultTurnsProps): string => {
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
    return fullTurnText;
  };
  componentWillReceiveProps(nextProps: VideoResultTurnsProps) {
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
  getTime = (props: VideoResultProps): string => {
    const { turn, videoFact } = props;
    const turnSeconds = videoFact.timestamps[videoFact.speakerWord[turn]];

    return (
      "@ " +
      convertSecondsToTimestamp(turnSeconds) +
      "/" +
      convertSecondsToTimestamp(props.videoFact.durationSeconds)
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

    const clipEnd = this.props.videoFact.timestamps[lastWord];

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
          {},
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
          <p className="turn__time">{this.getTime(this.props)}</p>
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

export default VideoResultsList;
