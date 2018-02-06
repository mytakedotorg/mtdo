import * as React from "react";
import * as ReactDOM from "react-dom";
import isEqual = require("lodash/isEqual");
import Document, { DocumentEventHandlers } from "./Document";
import ClipEditor, { ClipEditorEventHandlers } from "./ClipEditor";
import {
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  getSimpleRangesFromHTMLRange,
  highlightText,
  FoundationNode,
  SimpleRanges
} from "../utils/functions";
import { RangeSliders, RangeType } from "./Video";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";

export interface CaptionViewEventHandlers {
  onAfterRangeChange: (range: [number, number], type: RangeType) => any;
  onClearPress: () => void;
  onFineTuneDown: (rangeIdx: 0 | 1) => void;
  onFineTuneUp: (rangeIdx: 0 | 1) => void;
  onHighlight: (
    videoRange: [number, number],
    charRange: [number, number]
  ) => void;
  onPlayPausePress: () => any;
  onRangeChange: (range: [number, number], type: RangeType) => any;
  onRestartPress: () => any;
  onScroll: (viewRangeStart: number) => any;
  onSkipBackPress: (seconds: number) => any;
  onSkipForwardPress: (seconds: number) => any;
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
  rangeSliders: RangeSliders;
}

interface CaptionViewState {
  highlightedNodes?: FoundationNode[];
}

class CaptionView extends React.Component<CaptionViewProps, CaptionViewState> {
  private document: Document;
  private unhighlightedNodes: FoundationNode[];
  private simpleRanges: SimpleRanges | null;
  constructor(props: CaptionViewProps) {
    super(props);

    this.state = {};
  }
  getCaptionData = (nextProps?: CaptionViewProps): FoundationNode[] => {
    let captionIsHighlighted: boolean;
    let highlightedCharRange: [number, number] | undefined;
    let transcript: Foundation.CaptionWord[] | undefined;
    let speakerMap: Foundation.SpeakerMap[] | undefined;
    let clipStart: number;
    let clipEnd: number;
    let videoDuration: number;

    if (nextProps) {
      captionIsHighlighted = nextProps.captionIsHighlighted;
      highlightedCharRange = nextProps.highlightedCharRange;
      transcript = nextProps.videoFact.transcript;
      speakerMap = nextProps.videoFact.speakerMap;
      clipStart = nextProps.clipStart;
      clipEnd = nextProps.clipEnd;
      videoDuration = nextProps.videoDuration;
    } else {
      captionIsHighlighted = this.props.captionIsHighlighted;
      highlightedCharRange = this.props.highlightedCharRange;
      transcript = this.props.videoFact.transcript;
      speakerMap = this.props.videoFact.speakerMap;
      clipStart = this.props.clipStart;
      clipEnd = this.props.clipEnd;
      videoDuration = this.props.videoDuration;
    }

    if (transcript && speakerMap) {
      let captionNodes = getCaptionNodeArray(transcript, speakerMap);
      const unhighlightedNodes = [...captionNodes];
      let rawHighlightedText;
      if (captionIsHighlighted && highlightedCharRange) {
        captionNodes = highlightText(
          captionNodes,
          highlightedCharRange,
          () => {}
        );

        this.setState({
          highlightedNodes: captionNodes
        });
      } else {
        this.setState({
          highlightedNodes: captionNodes
        });
      }
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
        }
      }
    }
  };
  highlightNodes(simpleRanges: SimpleRanges) {
    const transcript = this.props.videoFact.transcript;
    const speakerMap = this.props.videoFact.speakerMap;
    if (transcript && speakerMap) {
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
      this.getCaptionData(nextProps);
    }
  }
  render() {
    const transcript = this.props.videoFact.transcript;
    const speakerMap = this.props.videoFact.speakerMap;

    const clipEditorEventHandlers: ClipEditorEventHandlers = {
      onAfterRangeChange: this.props.eventHandlers.onAfterRangeChange,
      onClearPress: this.props.eventHandlers.onClearPress,
      onFineTuneDown: this.props.eventHandlers.onFineTuneDown,
      onFineTuneUp: this.props.eventHandlers.onFineTuneUp,
      onPlayPausePress: this.props.eventHandlers.onPlayPausePress,
      onRestartPress: this.props.eventHandlers.onRestartPress,
      onRangeChange: this.props.eventHandlers.onRangeChange,
      onSkipBackPress: this.props.eventHandlers.onSkipBackPress,
      onSkipForwardPress: this.props.eventHandlers.onSkipForwardPress
    };

    const documentEventHandlers: DocumentEventHandlers = {
      onMouseUp: this.handleMouseUp,
      onScroll: this.props.eventHandlers.onScroll
    };

    return (
      <div className="captions">
        <ClipEditor
          eventHandlers={clipEditorEventHandlers}
          selection={[this.props.clipStart, this.props.clipEnd]}
          currentTime={this.props.timer}
          isPaused={this.props.isPaused}
          videoDuration={this.props.videoDuration}
          rangeSliders={this.props.rangeSliders}
        />
        {transcript && speakerMap && this.state.highlightedNodes ? (
          <Document
            ref={(document: Document) => (this.document = document)}
            eventHandlers={documentEventHandlers}
            className="document__row"
            captionData={{
              captionTimer: this.props.timer,
              transcript: transcript,
              speakerMap: speakerMap
            }}
            nodes={this.state.highlightedNodes}
            view={this.props.rangeSliders.transcriptViewRange}
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
