import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import {
  convertTimestampToSeconds,
  getCaptionNodeArray,
  getStartRangeOffsetTop,
  getWordCount,
  highlightText,
  HighlightedText,
  FoundationNode
} from "../../utils/functions";
import { getVideoCaptionWordMap } from "../../utils/databaseAPI";
import { CaptionWord } from "../../utils/databaseData";

interface Ranges {
  highlightedRange: [number, number];
  viewRange: [number, number];
}

interface CaptionViewProps {
  videoId: string;
  timer: number;
  ranges?: Ranges;
  onHighlight: (videoRange: [number, number]) => void;
  onClearPress: () => void;
  onCursorPlace: (videoTime: number) => void;
  captionIsHighlighted: boolean;
  onFineTuneUp: (rangeIdx: 0 | 1) => void;
  onFineTuneDown: (rangeIdx: 0 | 1) => void;
  videoStart: number;
  videoEnd: number;
}

interface CaptionViewState {
  highlightedRange: [number, number];
  viewRange: [number, number];
  highlightedNodes: FoundationNode[];
  currentIndex: number;
  captionMap: CaptionWord[];
}

class CaptionView extends React.Component<CaptionViewProps, CaptionViewState> {
  private document: Document;
  constructor(props: CaptionViewProps) {
    super(props);

    this.state = {
      highlightedRange: props.ranges ? props.ranges.highlightedRange : [0, 0],
      viewRange: props.ranges ? props.ranges.viewRange : [0, 0],
      highlightedNodes: getCaptionNodeArray(props.videoId),
      currentIndex: 0,
      captionMap: getVideoCaptionWordMap(props.videoId) || []
    };
  }
  handleClearClick = () => {
    this.setState({
      highlightedNodes: getCaptionNodeArray(this.props.videoId)
    });
    this.props.onClearPress();
  };
  handleMouseUp = () => {
    if (window.getSelection && !this.props.captionIsHighlighted) {
      // Pre IE9 will always be false
      let selection: Selection = window.getSelection();
      if (selection.toString().length) {
        // Some text is selected
        let range: Range = selection.getRangeAt(0);

        const highlightedText: HighlightedText = highlightText(
          range, // HTML Range, not [number, number] as in props.range
          this.document.getDocumentNodes(),
          ReactDOM.findDOMNode(this.document).childNodes,
          () => {} // noop
        );

        this.setState({
          highlightedNodes: highlightedText.newNodes,
          highlightedRange: highlightedText.highlightedCharacterRange
        });

        let startTime = convertTimestampToSeconds(
          this.state.captionMap[highlightedText.highlightedWordRange[0]]
            .timestamp
        );
        let endTime = convertTimestampToSeconds(
          this.state.captionMap[highlightedText.highlightedWordRange[1]]
            .timestamp
        );

        this.props.onHighlight([startTime, endTime]);
      } else {
        let wordCount = getWordCount(selection);
        let videoTime = convertTimestampToSeconds(
          this.state.captionMap[wordCount].timestamp
        );
        this.props.onCursorPlace(videoTime);
      }
    }
  };
  render() {
    return (
      <div className="captions">
        {this.props.captionIsHighlighted
          ? <div className="video__actions">
              <div className="video__action">
                <p className="video__instructions">
                  Press Play to see your clip
                </p>
                <button
                  className="video__button video__button--bottom"
                  onClick={this.handleClearClick}
                >
                  Clear Selection
                </button>
              </div>
              <div className="video__action">
                <p className="video__instructions">Fine tune your clip</p>
                <div className="video__tuning">
                  <div className="video__action">
                    <button
                      className="video__button video__button--small"
                      onClick={() => this.props.onFineTuneDown(0)}
                    >
                      <i className="fa fa-arrow-down" aria-hidden="true" />
                    </button>
                    <span className="video__time">
                      {this.props.videoStart >= 0
                        ? "Start: " + this.props.videoStart.toFixed(1)
                        : "Start: -" + this.props.videoStart.toFixed(1)}
                    </span>
                    <button
                      className="video__button video__button--small"
                      onClick={() => this.props.onFineTuneUp(0)}
                    >
                      <i className="fa fa-arrow-up" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="video__action">
                    <button
                      className="video__button video__button--small"
                      onClick={() => this.props.onFineTuneDown(1)}
                    >
                      <i className="fa fa-arrow-down" aria-hidden="true" />
                    </button>
                    <span className="video__time">
                      {this.props.videoEnd >= 0
                        ? "End: " + this.props.videoEnd.toFixed(1)
                        : "End: -" + this.props.videoEnd.toFixed(1)}
                    </span>
                    <button
                      className="video__button video__button--small"
                      onClick={() => this.props.onFineTuneUp(1)}
                    >
                      <i className="fa fa-arrow-up" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          : null}
        <Document
          excerptId={this.props.videoId}
          onMouseUp={this.handleMouseUp}
          ref={(document: Document) => (this.document = document)}
          className="document__row"
          captionData={{
            captionTimer: this.props.timer,
            captionMap: this.state.captionMap
          }}
          nodes={this.state.highlightedNodes}
        />
      </div>
    );
  }
}

export default CaptionView;
