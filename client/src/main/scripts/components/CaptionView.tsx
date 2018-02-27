import * as React from "react";
import * as ReactDOM from "react-dom";
import isEqual = require("lodash/isEqual");
import CaptionTextNodeListContainer, {
  CaptionTextNodeListContainerEventHandlers
} from "./CaptionTextNodeListContainer";
import ClipEditor, { ClipEditorEventHandlers } from "./ClipEditor";
import {
  alertErr,
  CaptionNodeArr,
  getCaptionNodeArray,
  getSimpleRangesFromHTMLRange,
  highlightCaption,
  FoundationNode,
  SimpleRanges
} from "../utils/functions";
import { RangeType, StateAuthority, TimeRange } from "./Video";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";

export interface CaptionViewEventHandlers {
  onAfterRangeChange: (
    value: [number, number] | number,
    type: RangeType
  ) => any;
  onClearPress: () => void;
  onHighlight: (
    videoRange: [number, number],
    charRange: [number, number]
  ) => void;
  onPlayPausePress: () => any;
  onRangeChange: (value: [number, number] | number, type: RangeType) => any;
  onRestartPress: () => any;
  onScroll: (viewRange: [number, number]) => any;
  onSkipBackPress: (seconds: number) => any;
  onSkipForwardPress: (seconds: number) => any;
  onZoomToClipPress: () => any;
}

interface CaptionViewProps {
  videoFact: Foundation.VideoFactContentFast;
  timer: number;
  captionIsHighlighted: boolean;
  isPaused: boolean;
  isZoomedToClip: boolean;
  videoDuration: number;
  eventHandlers: CaptionViewEventHandlers;
  highlightedCharRange?: [number, number];
  rangeSliders: TimeRange[];
  stateAuthority: StateAuthority;
}

interface CaptionViewState {
  highlightedNodes?: CaptionNodeArr;
}

class CaptionView extends React.Component<CaptionViewProps, CaptionViewState> {
  private captionNodesDiv: HTMLDivElement;
  private unhighlightedNodes: Array<string>;
  private simpleRanges: SimpleRanges | null;
  constructor(props: CaptionViewProps) {
    super(props);

    this.state = {};
  }
  getCaptionData = (nextProps?: CaptionViewProps): string[] => {
    let captionIsHighlighted: boolean;
    let highlightedCharRange: [number, number] | undefined;
    let videoFact: Foundation.VideoFactContentFast | undefined;

    if (nextProps) {
      captionIsHighlighted = nextProps.captionIsHighlighted;
      highlightedCharRange = nextProps.highlightedCharRange;
      videoFact = nextProps.videoFact;
    } else {
      captionIsHighlighted = this.props.captionIsHighlighted;
      highlightedCharRange = this.props.highlightedCharRange;
      videoFact = this.props.videoFact;
    }

    if (videoFact) {
      const rawCaptionNodes = getCaptionNodeArray(videoFact);
      const unhighlightedNodes = [...rawCaptionNodes];
      let rawHighlightedText;
      if (captionIsHighlighted && highlightedCharRange) {
        const captionNodes = highlightCaption(
          rawCaptionNodes,
          highlightedCharRange
        );

        this.setState({
          highlightedNodes: captionNodes
        });
      } else {
        this.setState({
          highlightedNodes: rawCaptionNodes
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
  getRangeSlider = (type: RangeType, rangeSliders: TimeRange[]): TimeRange => {
    for (const rangeSlider of rangeSliders) {
      if (rangeSlider.type === type) {
        return { ...rangeSlider };
      }
    }
    const msg = "Video: Can't find range of type " + type;
    alertErr(msg);
    throw msg;
  };
  handleClearClick = () => {
    const { videoFact } = this.props;
    if (videoFact) {
      this.setState({
        highlightedNodes: getCaptionNodeArray(videoFact)
      });
    } else {
      this.setState({
        highlightedNodes: undefined
      });
    }
    this.props.eventHandlers.onClearPress();
  };
  handleMouseUp = () => {
    if (window.getSelection) {
      // Pre IE9 will always be false
      const selection: Selection = window.getSelection();
      if (selection.toString().length) {
        // Some text is selected
        const range: Range = selection.getRangeAt(0);

        const simpleRanges = getSimpleRangesFromHTMLRange(
          range,
          ReactDOM.findDOMNode(this.captionNodesDiv).childNodes
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
  };
  highlightNodes(simpleRanges: SimpleRanges) {
    const { videoFact } = this.props;
    if (videoFact) {
      const newNodes = highlightCaption(
        [...this.unhighlightedNodes],
        simpleRanges.charRange
      );

      this.setState({
        highlightedNodes: newNodes
      });

      const startTime = videoFact.timestamps[simpleRanges.wordRange[0]];
      const endTime = videoFact.timestamps[simpleRanges.wordRange[1]];

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
    const clipEditorEventHandlers: ClipEditorEventHandlers = {
      onAfterRangeChange: this.props.eventHandlers.onAfterRangeChange,
      onClearPress: this.props.eventHandlers.onClearPress,
      onPlayPausePress: this.props.eventHandlers.onPlayPausePress,
      onRestartPress: this.props.eventHandlers.onRestartPress,
      onRangeChange: this.props.eventHandlers.onRangeChange,
      onSkipBackPress: this.props.eventHandlers.onSkipBackPress,
      onSkipForwardPress: this.props.eventHandlers.onSkipForwardPress,
      onZoomToClipPress: this.props.eventHandlers.onZoomToClipPress
    };

    const captionTextNodeListContainerEventHandlers: CaptionTextNodeListContainerEventHandlers = {
      onMouseUp: this.handleMouseUp,
      onScroll: this.props.eventHandlers.onScroll
    };

    const transcriptViewRange = this.getRangeSlider(
      "VIEW",
      this.props.rangeSliders
    );

    return (
      <div className="captions">
        <ClipEditor
          eventHandlers={clipEditorEventHandlers}
          captionIsHighlighted={this.props.captionIsHighlighted}
          currentTime={this.props.timer}
          isPaused={this.props.isPaused}
          isZoomedToClip={this.props.isZoomedToClip}
          videoDuration={this.props.videoDuration}
          rangeSliders={this.props.rangeSliders}
        />
        {this.props.videoFact && this.state.highlightedNodes ? (
          <div
            className="document document--static"
            ref={(div: HTMLDivElement) => (this.captionNodesDiv = div)}
          >
            <div className="document__row">
              <div className={"document__row-inner"}>
                <CaptionTextNodeListContainer
                  captionTimer={this.props.timer}
                  documentNodes={this.state.highlightedNodes}
                  eventHandlers={captionTextNodeListContainerEventHandlers}
                  stateAuthority={this.props.stateAuthority}
                  videoFact={this.props.videoFact}
                  view={transcriptViewRange}
                />
              </div>
            </div>
          </div>
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
