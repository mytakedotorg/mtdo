import * as React from "react";
import * as ReactDOM from "react-dom";
import isEqual = require("lodash/isEqual");
import Document from "./Document";
import ClipEditor, { ClipEditorEventHandlers } from "./ClipEditor";
import {
  getCaptionNodeArray,
  getSimpleRangesFromHTMLRange,
  getWordCount,
  highlightText,
  FoundationNode,
  SimpleRanges
} from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";

export interface CaptionViewEventHandlers {
  onHighlight: (
    videoRange: [number, number],
    charRange: [number, number]
  ) => void;
  onClearPress: () => void;
  onCursorPlace: (videoTime: number) => void;
  onFineTuneUp: (rangeIdx: 0 | 1) => void;
  onFineTuneDown: (rangeIdx: 0 | 1) => void;
  onPlayPausePress: () => any;
  onRangeChange: (range: [number, number], rangeIsMax: boolean) => any;
  onRestartPress: () => any;
  onSkipBackPress: () => any;
  onSkipForwardPress: () => any;
}

interface CaptionViewProps {
  videoFact: Foundation.VideoFactContent;
  timer: number;
  captionIsHighlighted: boolean;
  clipStart: number;
  clipEnd: number;
  isPaused: boolean;
  videoDuration: number;
  eventHandlers: CaptionViewEventHandlers;
  highlightedCharRange?: [number, number];
}

interface CaptionViewState {
  highlightedNodes?: FoundationNode[];
  currentIndex: number;
}

class CaptionView extends React.Component<CaptionViewProps, CaptionViewState> {
  private document: Document;
  private unhighlightedNodes: FoundationNode[];
  private simpleRanges: SimpleRanges | null;
  constructor(props: CaptionViewProps) {
    super(props);

    this.state = {
      currentIndex: 0
    };
  }
  getCaptionData = (
    nextPropsVideoFact?: Foundation.VideoFactContent,
    nextPropsCaptionIsHighlighted?: boolean,
    nextPropsHighlightedCharRange?: [number, number]
  ): FoundationNode[] => {
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

    if (transcript && speakerMap) {
      let captionNodes = getCaptionNodeArray(transcript, speakerMap);
      const unhighlightedNodes = [...captionNodes];
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
      return unhighlightedNodes;
    } else {
      this.setState({
        highlightedNodes: undefined
      });
      console.warn("Captions not yet done for this video");
      return [];
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
      if (window.getSelection) {
        // Pre IE9 will always be false
        const selection: Selection = window.getSelection();
        if (selection.toString().length) {
          // Some text is selected
          const range: Range = selection.getRangeAt(0);

          const simpleRanges = getSimpleRangesFromHTMLRange(
            range,
            ReactDOM.findDOMNode(this.document).childNodes
          );

          if (this.props.captionIsHighlighted) {
            // Must clear existing highlights before adding new ones
            // Store the ranges for use in next componentDidUpdate
            this.simpleRanges = (Object as any).assign({}, simpleRanges);
            // Clear all highlights
            this.setState({
              highlightedNodes: [...this.unhighlightedNodes]
            });
          } else {
            this.highlightNodes(simpleRanges);
          }
        } else if (selection) {
          // Text was clicked, but not selected
          let wordCount = getWordCount(selection);
          let videoTime = transcript[wordCount].timestamp;
          this.props.eventHandlers.onCursorPlace(videoTime);
        }
      }
    }
  };
  highlightNodes(simpleRanges: SimpleRanges) {
    const transcript = this.props.videoFact.transcript;
    if (transcript) {
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
    }
  }
  componentDidMount() {
    if (this.props.videoFact.youtubeId) {
      this.unhighlightedNodes = this.getCaptionData();
    }
  }
  componentDidUpdate() {
    if (this.simpleRanges) {
      // A new selection was made, highlight nodes...
      this.highlightNodes(this.simpleRanges);
      // ...and clear the temporarily stored ranges
      this.simpleRanges = null;
    }
  }
  componentWillReceiveProps(nextProps: CaptionViewProps) {
    if (
      (nextProps.videoFact.youtubeId !== this.props.videoFact.youtubeId &&
        this.props.videoFact.youtubeId) ||
      !isEqual(nextProps.highlightedCharRange, this.props.highlightedCharRange)
    ) {
      this.getCaptionData(
        nextProps.videoFact,
        nextProps.captionIsHighlighted,
        nextProps.highlightedCharRange
      );
    }
  }
  render() {
    const transcript = this.props.videoFact.transcript;
    const speakerMap = this.props.videoFact.speakerMap;

    const clipEditorEventHandlers: ClipEditorEventHandlers = {
      onClearPress: this.props.eventHandlers.onClearPress,
      onFineTuneDown: this.props.eventHandlers.onFineTuneDown,
      onFineTuneUp: this.props.eventHandlers.onFineTuneUp,
      onPlayPausePress: this.props.eventHandlers.onPlayPausePress,
      onRangeChange: this.props.eventHandlers.onRangeChange,
      onRestartPress: this.props.eventHandlers.onRestartPress,
      onSkipBackPress: this.props.eventHandlers.onSkipBackPress,
      onSkipForwardPress: this.props.eventHandlers.onSkipForwardPress
    };

    return (
      <div className="captions">
        <ClipEditor
          eventHandlers={clipEditorEventHandlers}
          clipStart={this.props.clipStart}
          clipEnd={this.props.clipEnd}
          currentTime={this.props.timer}
          isPaused={this.props.isPaused}
          videoDuration={this.props.videoDuration}
        />
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
          <div className="video__actions">
            <p className="video__instructions">
              For now, we only have captions for{" "}
              <a
                href={Routes.FOUNDATION_V1 + "/donald-trump-hillary-clinton-23"}
              >
                Trump/Hillary 2
              </a>{" "}
              and{" "}
              <a href={Routes.FOUNDATION_V1 + "/jimmy-carter-gerald-ford-23"}>
                Carter/Ford 2
              </a>.
            </p>
          </div>
        )}
      </div>
    );
  }
}

export default CaptionView;
