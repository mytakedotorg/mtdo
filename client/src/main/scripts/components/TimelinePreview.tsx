import * as React from "react";
import * as ReactDOM from "react-dom";
import isEqual = require("lodash/isEqual");
import Document, { DocumentEventHandlers } from "./Document";
import FactHeader, { StickyFactHeader } from "./FactHeader";
import DocumentTextNodeList from "./DocumentTextNodeList";
import Video from "./Video";
import { FoundationNode } from "../common/CaptionNodes";
import {
  getNodesInRange,
  getHighlightedNodes,
  getSimpleRangesFromHTMLRange,
  getStartRangeOffsetTop,
  highlightText,
} from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";

export interface SetFactHandlers {
  handleDocumentSetClick: (
    excerptId: string,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ) => void;
  handleVideoSetClick: (id: string, range: [number, number]) => void;
  handleRangeSet: (
    highlightRange: [number, number],
    viewRange?: [number, number]
  ) => void;
  handleRangeCleared: () => void;
}

export interface Ranges {
  highlightedRange: [number, number];
  viewRange?: [number, number];
}

interface TimelinePreviewProps {
  factLink: Foundation.FactLink;
  nodes?: FoundationNode[];
  videoFact?: Foundation.VideoFactContent;
  setFactHandlers?: SetFactHandlers;
  ranges?: Ranges;
  offset?: number;
}

interface TimelinePreviewState {
  highlightedRange: [number, number];
  viewRange: [number, number];
  textIsHighlighted: boolean;
  highlightedNodes: FoundationNode[];
  offsetTop: number;
}

export default class TimelinePreview extends React.Component<
  TimelinePreviewProps,
  TimelinePreviewState
> {
  private document: Document;
  constructor(props: TimelinePreviewProps) {
    super(props);

    this.state = {
      highlightedRange: props.ranges ? props.ranges.highlightedRange : [0, 0],
      viewRange:
        props.ranges && props.ranges.viewRange
          ? props.ranges.viewRange
          : [0, 0],
      textIsHighlighted: props.ranges ? true : false,
      highlightedNodes: [],
      offsetTop: 0,
    };
  }
  getScrollTop = (range?: [number, number]) => {
    // Get the scrollTop value of the top most HTML element containing the same highlighted nodes
    let theseDOMNodes = ReactDOM.findDOMNode(this.document).childNodes;

    let offsetTop = getStartRangeOffsetTop(
      theseDOMNodes,
      range ? range : this.state.viewRange
    );

    return offsetTop;
  };
  handleClearClick = () => {
    this.setState({
      textIsHighlighted: false,
      highlightedNodes: [],
    });
    if (this.props.setFactHandlers) {
      this.props.setFactHandlers.handleRangeCleared();
    }
  };
  handleMouseUp = () => {
    if (window.getSelection && !this.state.textIsHighlighted) {
      // Pre IE9 will always be false
      const selection = window.getSelection();
      if (selection?.toString().length) {
        //Some text is selected
        const range: Range = selection.getRangeAt(0);

        const simpleRanges = getSimpleRangesFromHTMLRange(
          range,
          ReactDOM.findDOMNode(this.document).childNodes
        );
        const newNodes = highlightText(
          [...this.document.getDocumentNodes()],
          simpleRanges.charRange,
          this.handleSetClick
        );

        const newHighlightedNodes = getNodesInRange(
          newNodes,
          simpleRanges.viewRange
        );

        const highlightedRange = simpleRanges.charRange;
        const viewRange = simpleRanges.viewRange;

        this.setState({
          highlightedNodes: newHighlightedNodes,
          highlightedRange: highlightedRange,
          viewRange: viewRange,
          textIsHighlighted: true,
          offsetTop: this.getScrollTop(simpleRanges.charRange),
        });

        if (this.props.setFactHandlers) {
          this.props.setFactHandlers.handleRangeSet(
            highlightedRange,
            viewRange
          );
        }
      }
    }
  };
  handleVideoRangeSet = (videoRange: [number, number]) => {
    if (this.props.setFactHandlers) {
      this.props.setFactHandlers.handleRangeSet(videoRange);
    }
    this.setState({
      textIsHighlighted: true,
    });
  };
  handleSetClick = (videoRange?: [number, number]) => {
    let factHash = this.props.factLink.hash;
    if (videoRange) {
      if (this.props.setFactHandlers) {
        this.props.setFactHandlers.handleVideoSetClick(factHash, videoRange);
      } else {
        // User is reading a Take with a video in it and clicked "Send to take"
        window.location.href =
          Routes.DRAFTS_NEW +
          "/#" +
          factHash +
          "&" +
          videoRange[0] +
          "&" +
          videoRange[1];
      }
    } else {
      let highlightedRange = this.state.highlightedRange;
      let viewRange = this.state.viewRange;
      if (this.props.setFactHandlers) {
        this.props.setFactHandlers.handleDocumentSetClick(
          factHash,
          highlightedRange,
          viewRange
        );
      } else {
        window.location.href =
          Routes.DRAFTS_NEW +
          "/#" +
          factHash +
          "&" +
          highlightedRange[0] +
          "&" +
          highlightedRange[1] +
          "&" +
          viewRange[0] +
          "&" +
          viewRange[1];
      }
    }
  };
  componentDidMount() {
    this.setup();
  }
  setup = (nextProps?: TimelinePreviewProps) => {
    let props;
    if (nextProps) {
      props = nextProps;
    } else {
      props = this.props;
    }

    if (props.ranges && props.ranges.viewRange) {
      // Get the list of nodes highlighted by a previous author
      let initialHighlightedNodes = getHighlightedNodes(
        this.document.getDocumentNodes(),
        props.ranges.highlightedRange,
        props.ranges.viewRange
      );

      // Get the scrollTop value of the top most HTML element containing the same highlighted nodes
      let theseDOMNodes = ReactDOM.findDOMNode(this).childNodes;
      let offsetTop;
      if (nextProps && nextProps.ranges) {
        offsetTop = this.getScrollTop(nextProps.ranges.highlightedRange);
      } else {
        offsetTop = this.getScrollTop();
      }

      // Scroll the Document to this offset
      let scrollTop = offsetTop + FactHeader.headerHeight;
      if (props.offset) {
        scrollTop -= props.offset;
      }

      window.scrollTo(0, scrollTop);

      this.setState({
        highlightedNodes: initialHighlightedNodes,
        highlightedRange: props.ranges ? props.ranges.highlightedRange : [0, 0],
        offsetTop: offsetTop,
        textIsHighlighted: true,
        viewRange:
          props.ranges && props.ranges.viewRange
            ? props.ranges.viewRange
            : [0, 0],
      });
    }
  };
  componentWillReceiveProps(nextProps: TimelinePreviewProps) {
    if (this.props.factLink.fact.title !== nextProps.factLink.fact.title) {
      this.setState({
        textIsHighlighted: false,
        highlightedNodes: [],
      });
    } else if (!nextProps.ranges) {
      this.setState({
        textIsHighlighted: false,
        highlightedNodes: [],
        highlightedRange: [0, 0],
        viewRange: [0, 0],
      });
    } else if (!isEqual(this.props.ranges, nextProps.ranges)) {
      this.setup(nextProps);
    }
  }
  render() {
    const documentEventHandlers: DocumentEventHandlers = {
      onMouseUp: this.handleMouseUp,
    };
    if (this.props.factLink.fact.kind === "document") {
      return (
        <div className={"timeline__preview"}>
          <StickyFactHeader
            heading={this.props.factLink.fact.title}
            highlightedRange={this.state.highlightedRange}
            factHash={this.props.factLink.hash}
            onClearClick={this.handleClearClick}
            onSetClick={this.handleSetClick}
            textIsHighlighted={this.state.textIsHighlighted}
            viewRange={this.state.viewRange}
            isDocument={
              this.props.factLink.fact.kind === "document" ? true : false
            }
          />
          {this.props.nodes ? (
            <Document
              nodes={this.props.nodes}
              eventHandlers={documentEventHandlers}
              ref={(document: Document) => (this.document = document)}
              className={"document__row"}
            >
              {this.state.textIsHighlighted ? (
                <div
                  className="editor__block editor__block--overlay"
                  style={{ top: this.state.offsetTop }}
                  onClick={() => this.handleSetClick()}
                >
                  <DocumentTextNodeList
                    className="editor__document editor__document--hover"
                    documentNodes={this.state.highlightedNodes}
                  />
                </div>
              ) : null}
            </Document>
          ) : null}
        </div>
      );
    } else {
      return (
        <div className={"timeline__preview"}>
          <FactHeader heading={this.props.factLink.fact.title} />
          {this.props.videoFact ? (
            <Video
              onSetClick={this.handleSetClick}
              onRangeSet={this.handleVideoRangeSet}
              onClearClick={this.handleClearClick}
              videoFact={this.props.videoFact}
              videoFactHash={this.props.factLink.hash}
              clipRange={
                this.props.ranges && !this.props.ranges.viewRange
                  ? this.props.ranges.highlightedRange
                  : null
              }
              className={"video__inner-container"}
            />
          ) : null}
        </div>
      );
    }
  }
}
