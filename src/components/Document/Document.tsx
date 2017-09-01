import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationTextType, FoundationNode } from "../Foundation";
import database from "../../utils/database";
import {
  getStartRangeOffsetTop,
  getNodeArray,
  getHighlightedNodes,
  highlightText,
  HighlightedText
} from "../../utils/functions";

interface DocumentProps {
  offset?: number;
  onBackClick: () => void;
  onSetClick: (type: FoundationTextType, range: [number, number]) => void;
  range?: [number, number];
  type: FoundationTextType;
}

interface DocumentState {
  documentNodes: FoundationNode[];
  range: [number, number];
  textIsHighlighted: boolean;
  initialHighlightedNodes: FoundationNode[];
  showInitialHighlights: boolean;
  offsetTop: number;
  headerHidden: boolean;
}

class Document extends React.Component<DocumentProps, DocumentState> {
  private docContainer: HTMLDivElement;
  private header: HTMLDivElement;
  static headerHeight = 80;
  constructor(props: DocumentProps) {
    super(props);

    this.state = {
      documentNodes: getNodeArray(props.type),
      range: props.range || [0, 0],
      textIsHighlighted: false,
      initialHighlightedNodes: [],
      showInitialHighlights: true,
      offsetTop: 0,
      headerHidden: false
    };
  }
  getDocumentHeading = () => {
    for (let document of database.documents) {
      if (document.type === this.props.type) {
        return document.heading;
      }
    }
    return "Foundation document";
  };
  handleClearClick = () => {
    this.setState({
      documentNodes: getNodeArray(this.props.type), //Clear existing highlights
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
          range: highlightedText.range,
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
    if (isInitialRange && this.props.range) {
      this.props.onSetClick(this.props.type, this.props.range);
    } else {
      this.props.onSetClick(this.props.type, this.state.range);
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
    if (this.props.range) {
      // Get the list of nodes highlighted by a previous author
      let initialHighlightedNodes = getHighlightedNodes(
        [...this.state.documentNodes],
        this.props.range
      );

      // Get the scrollTop value of the top most HTML element containing the same highlighted nodes
      let theseDOMNodes = ReactDOM.findDOMNode(this).childNodes;
      let offsetTop = getStartRangeOffsetTop(theseDOMNodes, this.props.range);

      // Scroll the Document to this offset
      let scrollTop = offsetTop - 20 + Document.headerHeight;
      if (this.props.offset) {
        scrollTop -= this.props.offset;
      }
      this.docContainer.scrollTop = scrollTop;

      this.setState({
        initialHighlightedNodes: initialHighlightedNodes,
        offsetTop: offsetTop - 20
      });
    }
  };
  render() {
    let classes = "document";
    if (this.props.range) {
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
          {this.props.range ? " Back to Take" : " Back to Foundation"}
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
        <div
          className={documentClass}
          ref={(docContainer: HTMLDivElement) =>
            (this.docContainer = docContainer)}
        >
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
            {this.props.range && this.state.showInitialHighlights
              ? <div
                  className="editor__block editor__block--overlay"
                  style={{ top: this.state.offsetTop }}
                  onClick={() => this.handleSetClick(true)}
                >
                  <div className="editor__document editor__document--overlay">
                    {this.state.initialHighlightedNodes.map((node, index) => {
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

export default Document;
