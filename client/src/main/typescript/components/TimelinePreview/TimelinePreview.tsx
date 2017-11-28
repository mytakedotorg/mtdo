import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import FactHeader from "../FactHeader";
import DocumentTextNodeList from "../DocumentTextNodeList";
import Video from "../Video";
import {
  FoundationNode,
  getFact,
  getNodesInRange,
  getHighlightedNodes,
  getSimpleRangesFromHTMLRange,
  getStartRangeOffsetTop,
  highlightTextTwo
} from "../../utils/functions";
import {
  DocumentFact,
  VideoFact,
  isDocument,
  isVideo
} from "../../utils/databaseData";
import { routes } from "../../utils/routes";

export interface SetFactHandlers {
  handleDocumentSetClick: (
    excerptId: string,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ) => void;
  handleVideoSetClick: (id: string, range: [number, number]) => void;
}

interface Ranges {
  highlightedRange: [number, number];
  viewRange: [number, number];
}

interface TimelinePreviewProps {
  excerptId: string;
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
  fact: DocumentFact | VideoFact | null;
  headerHidden: boolean;
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
      viewRange: props.ranges ? props.ranges.viewRange : [0, 0],
      textIsHighlighted: props.ranges ? true : false,
      highlightedNodes: [],
      offsetTop: 0,
      fact: getFact(props.excerptId),
      headerHidden: false
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
  getTitle = () => {
    let excerpt = getFact(this.props.excerptId);
    if (excerpt) {
      return excerpt.title;
    }
    return "";
  };
  handleClearClick = () => {
    this.setState({
      textIsHighlighted: false,
      highlightedNodes: []
    });
  };
  handleMouseUp = () => {
    if (window.getSelection && !this.state.textIsHighlighted) {
      // Pre IE9 will always be false
      const selection: Selection = window.getSelection();
      if (selection.toString().length) {
        //Some text is selected
        const range: Range = selection.getRangeAt(0);

        const simpleRanges = getSimpleRangesFromHTMLRange(
          range,
          ReactDOM.findDOMNode(this.document).childNodes
        );
        const newNodes = highlightTextTwo(
          [...this.document.getDocumentNodes()],
          simpleRanges.charRange,
          this.handleSetClick
        );

        const newHighlightedNodes = getNodesInRange(
          newNodes,
          simpleRanges.viewRange
        );

        this.setState({
          highlightedNodes: newHighlightedNodes,
          highlightedRange: simpleRanges.charRange,
          viewRange: simpleRanges.viewRange,
          textIsHighlighted: true,
          offsetTop: this.getScrollTop(simpleRanges.charRange)
        });
      }
    }
  };
  handleSetClick = (videoRange?: [number, number]) => {
    let excerptId = this.props.excerptId;
    if (videoRange) {
      if (this.props.setFactHandlers) {
        this.props.setFactHandlers.handleVideoSetClick(excerptId, videoRange);
      } else {
        window.location.href =
          routes.DRAFTS_NEW +
          "/#" +
          excerptId +
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
          excerptId,
          highlightedRange,
          viewRange
        );
      } else {
        window.location.href =
          routes.DRAFTS_NEW +
          "/#" +
          excerptId +
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
  handleScroll = (headerHidden: boolean) => {
    if (this.state.headerHidden != headerHidden) {
      this.setState({
        headerHidden: headerHidden
      });
    }
  };
  componentDidMount() {
    this.setup();
  }
  setup = () => {
    if (this.props.ranges) {
      // Get the list of nodes highlighted by a previous author
      let initialHighlightedNodes = getHighlightedNodes(
        this.document.getDocumentNodes(),
        this.props.ranges.highlightedRange,
        this.props.ranges.viewRange
      );

      // Get the scrollTop value of the top most HTML element containing the same highlighted nodes
      let theseDOMNodes = ReactDOM.findDOMNode(this).childNodes;
      let offsetTop = this.getScrollTop();

      // Scroll the Document to this offset
      let scrollTop = offsetTop + FactHeader.headerHeight;
      if (this.props.offset) {
        scrollTop -= this.props.offset;
      }

      window.scrollTo(0, scrollTop);

      this.setState({
        highlightedNodes: initialHighlightedNodes,
        offsetTop: offsetTop
      });
    }
  };
  componentWillReceiveProps(nextProps: TimelinePreviewProps) {
    if (this.props.excerptId !== nextProps.excerptId) {
      this.setState({
        fact: getFact(nextProps.excerptId),
        textIsHighlighted: false,
        highlightedNodes: []
      });
    }
  }
  render() {
    let documentClass = "document__row";
    if (this.state.headerHidden) {
      documentClass += " document__row--push";
    }

    return (
      <div className={"timeline__preview"}>
        <FactHeader
          heading={this.getTitle()}
          isFixed={this.state.headerHidden}
          onClearClick={this.handleClearClick}
          onSetClick={this.handleSetClick}
          onScroll={this.handleScroll}
          textIsHighlighted={this.state.textIsHighlighted}
          isDocument={isDocument(this.state.fact)}
        />
        {isDocument(this.state.fact)
          ? <Document
              excerptId={this.props.excerptId}
              onMouseUp={this.handleMouseUp}
              ref={(document: Document) => (this.document = document)}
              className={
                this.state.headerHidden
                  ? "document__row document__row--push"
                  : "document__row"
              }
            >
              {this.state.textIsHighlighted
                ? <div
                    className="editor__block editor__block--overlay"
                    style={{ top: this.state.offsetTop }}
                    onClick={() => this.handleSetClick()}
                  >
                    <DocumentTextNodeList
                      className="editor__document editor__document--hover"
                      documentNodes={this.state.highlightedNodes}
                    />
                  </div>
                : null}
            </Document>
          : null}
        {isVideo(this.state.fact)
          ? <Video
              onSetClick={this.handleSetClick}
              video={this.state.fact}
              className={
                this.state.headerHidden
                  ? "video__inner-container video__inner-container--push"
                  : "video__inner-container"
              }
            />
          : null}
      </div>
    );
  }
}
