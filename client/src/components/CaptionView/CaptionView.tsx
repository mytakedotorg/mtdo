import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import {
  getCaptionNodeArray,
  getWordCount,
  highlightText,
  HighlightedText,
  FoundationNode
} from "../../utils/functions";
import {
  getVideoCaptionWordMap,
  getVideoCaptionMetaData
} from "../../utils/databaseAPI";
import { CaptionWord, CaptionMeta } from "../../utils/databaseData";

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
      highlightedRange: props.ranges ? props.ranges.highlightedRange : [0, 0],
      viewRange: props.ranges ? props.ranges.viewRange : [0, 0],
      currentIndex: 0
    };
  }
  getCaptionData = () => {
    try {
      let captionMap = getVideoCaptionWordMap(this.props.videoId);
      let captionMeta = getVideoCaptionMetaData(this.props.videoId);
      this.setState({
        highlightedNodes: getCaptionNodeArray(this.props.videoId),
        captionMap: captionMap,
        captionMeta: captionMeta
      });
    } catch (e) {
      console.warn(
        "Couldn't get caption data for video with id " + this.props.videoId
      );
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
    this.props.onClearPress();
  };
  handleMouseUp = () => {
    if (this.state.captionMap) {
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

          let startTime = this.state.captionMap[
            highlightedText.highlightedWordRange[0]
          ].timestamp;
          let endTime = this.state.captionMap[
            highlightedText.highlightedWordRange[1]
          ].timestamp;

          this.props.onHighlight([startTime, endTime]);
        } else if (selection) {
          let wordCount = getWordCount(selection);
          let videoTime = this.state.captionMap[wordCount].timestamp;
          this.props.onCursorPlace(videoTime);
        }
      }
    }
  };
  componentDidMount() {
    if (this.props.videoId) {
      this.getCaptionData();
    }
  }
  componentDidUpdate(prevProps: CaptionViewProps, prevState: CaptionViewState) {
    if (prevProps.videoId !== this.props.videoId && this.props.videoId) {
      this.getCaptionData();
    }
  }
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
