import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationTextType, FoundationNode } from "../Foundation";
import database from "../../utils/database";
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
  documentNodes: FoundationNode[];
  highlightedRange: [number, number];
  textIsHighlighted: boolean;
  highlightedNodes: FoundationNode[];
  showInitialHighlights: boolean;
  offsetTop: number;
  headerHidden: boolean;
}

class DocumentFullScreen extends React.Component<
  DocumentFullScreenProps,
  DocumentFullScreenState
> {
  private header: HTMLDivElement;
  static headerHeight = 219;
  constructor(props: DocumentFullScreenProps) {
    super(props);

    this.state = {
      documentNodes: getNodeArray(props.excerptId),
      highlightedRange: props.highlightedRange || [0, 0],
      textIsHighlighted: false,
      highlightedNodes: [],
      showInitialHighlights: true,
      offsetTop: 0,
      headerHidden: false
    };
  }
  getDocumentHeading = () => {
    for (let excerpt of database.excerpts) {
      if (slugify(excerpt.title) === this.props.excerptId) {
        return excerpt.title;
      }
    }
    return "Foundation document";
  };
  handleClearClick = () => {
    this.setState({
      documentNodes: getNodeArray(this.props.excerptId), //Clear existing highlights
      textIsHighlighted: false
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
          [...this.state.documentNodes],
          ReactDOM.findDOMNode(this).childNodes,
          this.handleSetClick
        );

        this.setState({
          documentNodes: highlightedText.newNodes,
          highlightedRange: highlightedText.range,
          textIsHighlighted: true,
          showInitialHighlights: false
        });
      }
    }
  };
  handleScroll = () => {
    this.setState({
      headerHidden: this.header.getBoundingClientRect().top <= 0
    });
  };
  handleSetClick = (isInitialRange?: boolean) => {
    if (isInitialRange && this.props.highlightedRange) {
      this.props.onSetClick(this.props.excerptId, this.props.highlightedRange);
    } else {
      this.props.onSetClick(this.props.excerptId, this.state.highlightedRange);
    }
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
        [...this.state.documentNodes],
        this.props.highlightedRange
      );

      // Get the scrollTop value of the top most HTML element containing the same highlighted nodes
      let theseDOMNodes = ReactDOM.findDOMNode(this).childNodes;
      let offsetTop = getStartRangeOffsetTop(
        theseDOMNodes,
        this.props.highlightedRange
      );

      // Scroll the Document to this offset
      let scrollTop = offsetTop - 20 + DocumentFullScreen.headerHeight;
      if (this.props.offset) {
        scrollTop -= this.props.offset;
      }

      window.scrollTo(0, scrollTop);

      this.setState({
        highlightedNodes: initialHighlightedNodes,
        offsetTop: offsetTop - 20
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
        <div className={documentClass}>
          <div className={"document__row-inner"}>
            <div className={"document__text"} onMouseUp={this.handleMouseUp}>
              {this.state.documentNodes.map(function(
                element: FoundationNode,
                index: number
              ) {
                element.props["key"] = index.toString();
                return React.createElement(
                  element.component,
                  element.props,
                  element.innerHTML
                );
              })}
            </div>
            {this.props.highlightedRange && this.state.showInitialHighlights
              ? <div
                  className="editor__block editor__block--overlay"
                  style={{ top: this.state.offsetTop }}
                  onClick={() => this.handleSetClick(true)}
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
          </div>
        </div>
      </div>
    );
  }
}

export default DocumentFullScreen;
