import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationTextType, FoundationNode } from "../Foundation";
import { getDocumentExcerptTitle } from "../../utils/databaseAPI";
import Document from "../Document";
import {
  getStartRangeOffsetTop,
  getNodeArray,
  getNodesInRange,
  getHighlightedNodes,
  highlightText,
  HighlightedText,
  slugify
} from "../../utils/functions";

interface DocumentFullScreenProps {
  offset?: number;
  onBackClick: () => void;
  onSetClick: (excerptId: string, highlightedRange: [number, number]) => void;
  highlightedRange?: [number, number];
  viewRange?: [number, number];
  excerptId: string;
}

interface DocumentFullScreenState {
  highlightedRange: [number, number];
  textIsHighlighted: boolean;
  highlightedNodes: FoundationNode[];
  offsetTop: number;
  headerHidden: boolean;
}

class DocumentFullScreen extends React.Component<
  DocumentFullScreenProps,
  DocumentFullScreenState
> {
  private header: HTMLDivElement;
  private document: Document;
  static headerHeight = 219;
  constructor(props: DocumentFullScreenProps) {
    super(props);

    this.state = {
      highlightedRange: props.highlightedRange || [0, 0],
      textIsHighlighted: props.highlightedRange ? true : false,
      highlightedNodes: [],
      offsetTop: 0,
      headerHidden: false
    };
  }
  getDocumentHeading = () => {
    let title = getDocumentExcerptTitle(this.props.excerptId);
    return title ? title : "Foundation document";
  };
  getScrollTop = (range?: [number, number]) => {
    // Get the scrollTop value of the top most HTML element containing the same highlighted nodes
    let theseDOMNodes = ReactDOM.findDOMNode(this.document).childNodes;

    let offsetTop = getStartRangeOffsetTop(
      theseDOMNodes,
      range ? range : this.state.highlightedRange
    );

    return offsetTop - 20;
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
  handleScroll = () => {
    this.setState({
      headerHidden: this.header.getBoundingClientRect().top <= 0
    });
  };
  handleSetClick = () => {
    this.props.onSetClick(this.props.excerptId, this.state.highlightedRange);
  };
  componentDidMount() {
    this.setup();
    window.addEventListener("scroll", this.handleScroll);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
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
      let scrollTop = offsetTop + DocumentFullScreen.headerHeight;
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
  render() {
    let classes = "document";
    if (this.props.highlightedRange) {
      classes += " document--overlay";
    } else {
      classes += " document--static";
    }

    let headerClass = "document__header";
    let documentClass = "document__row";
    if (this.state.headerHidden) {
      headerClass += " document__header--hidden";
      documentClass += " document__row--push";
    } else {
      headerClass += " document__header--visible";
    }

    const headerContent = (
      <div>
        <h2 className={"document__heading"}>
          {this.getDocumentHeading()}
        </h2>
        <button className="document__button" onClick={this.props.onBackClick}>
          <i className="fa fa-long-arrow-left" aria-hidden="true" />
          {this.props.highlightedRange
            ? " Back to Take"
            : " Back to Foundation"}
        </button>
        {this.state.textIsHighlighted
          ? <button
              className="document__button"
              onClick={this.handleClearClick}
            >
              Clear Selection
            </button>
          : null}
      </div>
    );

    return (
      <div className={classes}>
        <div
          className={headerClass}
          ref={(header: HTMLDivElement) => (this.header = header)}
        >
          {headerContent}
        </div>
        <div className={"document__header document__header--fixed"}>
          {headerContent}
        </div>
        <Document
          excerptId={this.props.excerptId}
          onMouseUp={this.handleMouseUp}
          ref={(document: Document) => (this.document = document)}
          className={documentClass}
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
      </div>
    );
  }
}

export default DocumentFullScreen;
