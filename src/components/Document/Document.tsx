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
  backButtonText?: string;
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
}

class Document extends React.Component<DocumentProps, DocumentState> {
  private div: HTMLDivElement;
  static headerHeight = 80;
  constructor(props: DocumentProps) {
    super(props);

    this.state = {
      documentNodes: getNodeArray(props.type),
      range: props.range || [0, 0],
      textIsHighlighted: false,
      initialHighlightedNodes: [],
      showInitialHighlights: true,
      offsetTop: 0
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
  handleSetClick = (isInitialRange?: boolean) => {
    if (isInitialRange && this.props.range) {
      this.props.onSetClick(this.props.type, this.props.range);
    } else {
      this.props.onSetClick(this.props.type, this.state.range);
    }
  };
  componentDidMount() {
    this.setup();
  }
  componentWillUnmount() {
    this.tearDown();
  }
  setup = () => {
    if (this.props.range) {
      // Show Amendments over an existing take with pre-existing and uneditable highlights
      document.body.classList.add("noscroll");

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
      this.div.scrollTop = scrollTop;

      this.setState({
        initialHighlightedNodes: initialHighlightedNodes,
        offsetTop: offsetTop - 20
      });
    } else {
      document.body.classList.remove("noscroll");
    }
  };
  tearDown = () => {
    document.body.classList.remove("noscroll");
  };
  render() {
    let cssBlock = "document";
    let classes = cssBlock;
    if (this.props.range) {
      classes += " " + cssBlock + "--overlay";
    } else {
      classes += " " + cssBlock + "--static";
    }
    return (
      <div className={classes}>
        <div className={cssBlock + "__header"}>
          <button onClick={this.props.onBackClick}>
            {this.props.backButtonText
              ? this.props.backButtonText
              : "Back to Foundation"}
          </button>
          <button onClick={this.handleClearClick}>Clear Selection</button>
          <h2 className={cssBlock + "__heading"}>
            {this.getDocumentHeading()}
          </h2>
        </div>
        <div
          className={cssBlock + "__row"}
          ref={(div: HTMLDivElement) => (this.div = div)}
        >
          <div className={cssBlock + "__row-inner"}>
            <div className={cssBlock + "__text"} onMouseUp={this.handleMouseUp}>
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
