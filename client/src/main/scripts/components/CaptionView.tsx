import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "./Document";
import {
  convertSecondsToTimestamp,
  getCaptionNodeArray,
  getSimpleRangesFromHTMLRange,
  getWordCount,
  highlightText,
  FoundationNode
} from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";

export interface EventHandlers {
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
  videoFact: Foundation.VideoFactContent;
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
    nextPropsVideoFact?: Foundation.VideoFactContent,
    nextPropsCaptionIsHighlighted?: boolean,
    nextPropsHighlightedCharRange?: [number, number]
  ) => {
    let captionIsHighlighted: boolean;
    let highlightedCharRange: [number, number] | undefined;
    let transcript: Foundation.CaptionWord[] | undefined;
    let speakerMap: Foundation.SpeakerMap[] | undefined;

    if (typeof nextPropsCaptionIsHighlighted == "boolean") {
      captionIsHighlighted = nextPropsCaptionIsHighlighted;
    } else {
      captionIsHighlighted = this.props.captionIsHighlighted;
    }

    if (nextPropsHighlightedCharRange) {
      highlightedCharRange = nextPropsHighlightedCharRange;
    } else {
      highlightedCharRange = this.props.highlightedCharRange;
    }

    if (nextPropsVideoFact) {
      transcript = nextPropsVideoFact.transcript;
      speakerMap = nextPropsVideoFact.speakerMap;
    } else {
      transcript = this.props.videoFact.transcript;
      speakerMap = this.props.videoFact.speakerMap;
    }

    try {
      if (transcript && speakerMap) {
        let captionNodes = getCaptionNodeArray(transcript, speakerMap);
        if (captionIsHighlighted && highlightedCharRange) {
          captionNodes = highlightText(
            captionNodes,
            highlightedCharRange,
            () => {}
          );
        }
        this.setState({
          highlightedNodes: captionNodes
        });
      } else {
        this.setState({
          highlightedNodes: undefined
        });
        console.warn("Captions not yet done for this video");
      }
    } catch (e) {
      throw e;
    }
  };
  handleClearClick = () => {
    const transcript = this.props.videoFact.transcript;
    const speakerMap = this.props.videoFact.speakerMap;
    if (transcript && speakerMap) {
      this.setState({
        highlightedNodes: getCaptionNodeArray(transcript, speakerMap)
      });
    } else {
      this.setState({
        highlightedNodes: undefined
      });
    }
    this.props.eventHandlers.onClearPress();
  };
  handleMouseUp = () => {
    const transcript = this.props.videoFact.transcript;
    if (transcript) {
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

          const newNodes = highlightText(
            [...this.document.getDocumentNodes()],
            simpleRanges.charRange,
            () => {}
          );

          this.setState({
            highlightedNodes: newNodes
          });

          let startTime = transcript[simpleRanges.wordRange[0]].timestamp;
          let endTime = transcript[simpleRanges.wordRange[1]].timestamp;

          this.props.eventHandlers.onHighlight(
            [startTime, endTime],
            simpleRanges.charRange
          );
        } else if (selection) {
          let wordCount = getWordCount(selection);
          let videoTime = transcript[wordCount].timestamp;
          this.props.eventHandlers.onCursorPlace(videoTime);
        }
      }
    }
  };
  componentDidMount() {
    if (this.props.videoFact.youtubeId) {
      this.getCaptionData();
    }
  }
  componentWillReceiveProps(nextProps: CaptionViewProps) {
    if (
      nextProps.videoFact.youtubeId !== this.props.videoFact.youtubeId &&
      this.props.videoFact.youtubeId
    ) {
      this.getCaptionData(
        nextProps.videoFact,
        nextProps.captionIsHighlighted,
        nextProps.highlightedCharRange
      );
    }
  }
  render() {
    const startTime = convertSecondsToTimestamp(this.props.videoStart);
    const endTime = convertSecondsToTimestamp(this.props.videoEnd);

    const transcript = this.props.videoFact.transcript;
    const speakerMap = this.props.videoFact.speakerMap;

    return (
      <div className="captions">
        {this.props.captionIsHighlighted ? (
          <div className="video__actions">
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
                      onClick={() => this.props.eventHandlers.onFineTuneDown(0)}
                    >
                      <i className="fa fa-arrow-down" aria-hidden="true" />
                    </button>
                    <span className="video__time">{startTime}</span>
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
                      onClick={() => this.props.eventHandlers.onFineTuneDown(1)}
                    >
                      <i className="fa fa-arrow-down" aria-hidden="true" />
                    </button>
                    <span className="video__time">{endTime}</span>
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
        ) : null}
        {transcript && speakerMap && this.state.highlightedNodes ? (
          <Document
            onMouseUp={this.handleMouseUp}
            ref={(document: Document) => (this.document = document)}
            className="document__row"
            captionData={{
              captionTimer: this.props.timer,
              transcript: transcript,
              speakerMap: speakerMap
            }}
            nodes={this.state.highlightedNodes}
          />
        ) : (
          <p className="video__instructions">
            We're still working on adding captions for this video
          </p>
        )}
      </div>
    );
  }
}

export default CaptionView;
