import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import {
  convertSecondsToTimestamp,
  getCaptionNodeArray,
  getSimpleRangesFromHTMLRange,
  getWordCount,
  highlightTextTwo,
  FoundationNode
} from "../../utils/functions";
import {
  getVideoCaptionWordMap,
  getVideoCaptionMetaData
} from "../../utils/databaseAPI";
import { CaptionWord, CaptionMeta } from "../../utils/databaseData";

interface EventHandlers {
  onHighlight: (
    videoRange: [number, number],
    charRange: [number, number]
  ) => void;
  onClearPress: () => void;
  onCursorPlace: (videoTime: number) => void;
  onFineTuneUp: (rangeIdx: 0 | 1) => void;
  onFineTuneDown: (rangeIdx: 0 | 1) => void;
}

interface CaptionViewProps {
  videoId: string;
  timer: number;
  captionIsHighlighted: boolean;
  videoStart: number;
  videoEnd: number;
  eventHandlers: EventHandlers;
  highlightedCharRange?: [number, number];
}

interface CaptionViewState {
  viewRange: [number, number];
  highlightedNodes?: FoundationNode[];
  currentIndex: number;
  captionMap?: CaptionWord[];
  captionMeta?: CaptionMeta;
}

class CaptionView extends React.Component<CaptionViewProps, CaptionViewState> {
  private document: Document;
  constructor(props: CaptionViewProps) {
    super(props);

    this.state = {
      viewRange: [0, 0],
      currentIndex: 0
    };
  }
  getCaptionData = (
    npVideoId?: string,
    npCaptionIsHighlighted?: boolean,
    npHighlightedCharRange?: [number, number]
  ) => {
    const videoId = npVideoId ? npVideoId : this.props.videoId;
    const captionIsHighlighted = npCaptionIsHighlighted
      ? npCaptionIsHighlighted
      : this.props.captionIsHighlighted;
    const highlightedCharRange = npHighlightedCharRange
      ? npHighlightedCharRange
      : this.props.highlightedCharRange;
    try {
      let captionMap = getVideoCaptionWordMap(videoId);
      let captionMeta = getVideoCaptionMetaData(videoId);
      let captionNodes = getCaptionNodeArray(videoId);
      if (captionIsHighlighted && highlightedCharRange) {
        captionNodes = highlightTextTwo(
          captionNodes,
          highlightedCharRange,
          () => {
            throw "todo";
          }
        );
      }
      this.setState({
        highlightedNodes: captionNodes,
        captionMap: captionMap,
        captionMeta: captionMeta
      });
    } catch (e) {
      console.warn(e);
      this.setState({
        highlightedNodes: undefined,
        captionMap: undefined,
        captionMeta: undefined
      });
    }
  };
  handleClearClick = () => {
    this.setState({
      highlightedNodes: getCaptionNodeArray(this.props.videoId)
    });
    this.props.eventHandlers.onClearPress();
  };
  handleMouseUp = () => {
    if (this.state.captionMap) {
      if (window.getSelection && !this.props.captionIsHighlighted) {
        // Pre IE9 will always be false
        const selection: Selection = window.getSelection();
        if (selection.toString().length) {
          // Some text is selected
          const range: Range = selection.getRangeAt(0);

          const simpleRanges = getSimpleRangesFromHTMLRange(
            range,
            ReactDOM.findDOMNode(this.document).childNodes
          );

          const newNodes = highlightTextTwo(
            [...this.document.getDocumentNodes()],
            simpleRanges.charRange,
            () => {
              throw "todo";
            }
          );

          this.setState({
            highlightedNodes: newNodes
          });

          let startTime = this.state.captionMap[simpleRanges.wordRange[0]]
            .timestamp;
          let endTime = this.state.captionMap[simpleRanges.wordRange[1]]
            .timestamp;

          this.props.eventHandlers.onHighlight(
            [startTime, endTime],
            simpleRanges.charRange
          );
        } else if (selection) {
          let wordCount = getWordCount(selection);
          let videoTime = this.state.captionMap[wordCount].timestamp;
          this.props.eventHandlers.onCursorPlace(videoTime);
        }
      }
    }
  };
  componentDidMount() {
    if (this.props.videoId) {
      this.getCaptionData();
    }
  }
  componentWillReceiveProps(nextProps: CaptionViewProps) {
    if (nextProps.videoId !== this.props.videoId && this.props.videoId) {
      this.getCaptionData(nextProps.videoId);
    }
  }
  render() {
    const startTime = convertSecondsToTimestamp(this.props.videoStart);
    const endTime = convertSecondsToTimestamp(this.props.videoEnd);

    return (
      <div className="captions">
        {this.props.captionIsHighlighted
          ? <div className="video__actions">
              <div className="video__action">
                <p className="video__instructions">Fine tune your clip</p>
                <button
                  className="video__button video__button--bottom"
                  onClick={this.handleClearClick}
                >
                  Clear Selection
                </button>
              </div>
              <div className="video__action">
                <div className="video__tuning">
                  <div className="video__action">
                    <p className="video__instructions">Start Time</p>
                    <div className="video__tuning-buttons">
                      <button
                        className="video__button video__button--small"
                        onClick={() =>
                          this.props.eventHandlers.onFineTuneDown(0)}
                      >
                        <i className="fa fa-arrow-down" aria-hidden="true" />
                      </button>
                      <span className="video__time">
                        {startTime}
                      </span>
                      <button
                        className="video__button video__button--small"
                        onClick={() => this.props.eventHandlers.onFineTuneUp(0)}
                      >
                        <i className="fa fa-arrow-up" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <div className="video__action">
                    <p className="video__instructions">End Time</p>
                    <div className="video__tuning-buttons">
                      <button
                        className="video__button video__button--small"
                        onClick={() =>
                          this.props.eventHandlers.onFineTuneDown(1)}
                      >
                        <i className="fa fa-arrow-down" aria-hidden="true" />
                      </button>
                      <span className="video__time">
                        {endTime}
                      </span>
                      <button
                        className="video__button video__button--small"
                        onClick={() => this.props.eventHandlers.onFineTuneUp(1)}
                      >
                        <i className="fa fa-arrow-up" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          : null}
        {this.state.captionMap &&
        this.state.captionMeta &&
        this.state.highlightedNodes
          ? <Document
              excerptId={this.props.videoId}
              onMouseUp={this.handleMouseUp}
              ref={(document: Document) => (this.document = document)}
              className="document__row"
              captionData={{
                captionTimer: this.props.timer,
                captionMap: this.state.captionMap,
                captionMeta: this.state.captionMeta
              }}
              nodes={this.state.highlightedNodes}
            />
          : <p className="video__instructions">
              We're still working on adding captions for this video
            </p>}
      </div>
    );
  }
}

export default CaptionView;
