import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import FactHeader from "../FactHeader";
import Video from "../Video";
import {
  FoundationNode,
  getFact,
  getHighlightedNodes,
  getStartRangeOffsetTop,
  highlightText,
  HighlightedText,
  slugify
} from "../../utils/functions";
import {
  DocumentFact,
  VideoFact,
  isDocument,
  isVideo
} from "../../utils/databaseData";

export interface SetFactHandlers {
  handleDocumentSetClick: (excerptId: string, range: [number, number]) => void;
  handleVideoSetClick: (id: string, range: [number, number]) => void;
}

interface TimelinePreviewProps {
  excerptId: string;
  setFactHandlers?: SetFactHandlers;
  highlightedRange?: [number, number];
  offset?: number;
}

interface TimelinePreviewState {
  highlightedRange: [number, number];
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
      highlightedRange: props.highlightedRange || [0, 0],
      textIsHighlighted: props.highlightedRange ? true : false,
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
      range ? range : this.state.highlightedRange
    );

    return offsetTop - 20;
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
      let selection: Selection = window.getSelection();
      if (selection.toString().length) {
        //Some text is selected
        let range: Range = selection.getRangeAt(0);

        const highlightedText: HighlightedText = highlightText(
          range, // HTML Range, not [number, number] as in props.range
          this.document.getDocumentNodes(),
          ReactDOM.findDOMNode(this.document).childNodes,
          this.handleSetClick
        );

        const newHighlightedNodes = getHighlightedNodes(
          this.document.getDocumentNodes(),
          highlightedText.range
        );

        this.setState({
          highlightedNodes: newHighlightedNodes,
          highlightedRange: highlightedText.range,
          textIsHighlighted: true,
          offsetTop: this.getScrollTop(highlightedText.range)
        });
      }
    }
  };
  handleSetClick = (videoRange?: [number, number]) => {
    let range: [number, number];
    let excerptId = this.props.excerptId;
    if (videoRange) {
      if (this.props.setFactHandlers) {
        this.props.setFactHandlers.handleVideoSetClick(excerptId, videoRange);
      } else {
        window.location.href =
          "/new-take/#" + excerptId + "&" + videoRange[0] + "&" + videoRange[1];
      }
    } else {
      range = this.state.highlightedRange;
      if (this.props.setFactHandlers) {
        this.props.setFactHandlers.handleDocumentSetClick(excerptId, range);
      } else {
        window.location.href =
          "/new-take/#" + excerptId + "&" + range[0] + "&" + range[1];
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
    if (this.props.highlightedRange) {
      // Get the list of nodes highlighted by a previous author
      let initialHighlightedNodes = getHighlightedNodes(
        this.document.getDocumentNodes(),
        this.props.highlightedRange
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
        offsetTop: this.getScrollTop()
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
    let headerClass = "document__header";
    let documentClass = "document__row";
    if (this.state.headerHidden) {
      headerClass += " document__header--hidden";
      documentClass += " document__row--push";
    } else {
      headerClass += " document__header--visible";
    }

    return (
      <div className={"timeline__preview"}>
        <FactHeader
          heading={this.getTitle()}
          className={headerClass}
          onClearClick={this.handleClearClick}
          onScroll={this.handleScroll}
          textIsHighlighted={this.state.textIsHighlighted}
        />
        {isDocument(this.state.fact)
          ? <Document
              excerptId={this.props.excerptId}
              onMouseUp={this.handleMouseUp}
              ref={(document: Document) => (this.document = document)}
            >
              {this.state.textIsHighlighted
                ? <div
                    className="editor__block editor__block--overlay"
                    style={{ top: this.state.offsetTop }}
                    onClick={() => this.handleSetClick()}
                  >
                    <div className="editor__document editor__document--overlay">
                      {this.state.highlightedNodes.map((node, index) => {
                        node.props["key"] = index.toString();
                        return React.createElement(
                          node.component,
                          node.props,
                          node.innerHTML
                        );
                      })}
                    </div>
                  </div>
                : null}
            </Document>
          : null}
        {isVideo(this.state.fact)
          ? <Video onSetClick={this.handleSetClick} video={this.state.fact} />
          : null}
      </div>
    );
  }
}
