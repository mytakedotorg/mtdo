import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import { FoundationNode } from "../Foundation";
import {
  getExcerpt,
  getHighlightedNodes,
  getStartRangeOffsetTop,
  highlightText,
  HighlightedText
} from "../../utils/functions";

interface TimelinePreviewProps {
  excerptId: string;
}

interface TimelinePreviewState {
  highlightedRange: [number, number];
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
      highlightedRange: [0, 0],
      textIsHighlighted: false,
      highlightedNodes: [],
      offsetTop: 0
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
    return getExcerpt(this.props.excerptId).title;
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
  handleSetClick = () => {
    //TODO, set window.location.href
  };
  render() {
    return (
      <div>
        <h3>
          {this.getTitle()}
        </h3>
        {this.state.textIsHighlighted
          ? <button
              className="document__button"
              onClick={this.handleClearClick}
            >
              Clear Selection
            </button>
          : null}
        <Document
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
      </div>
    );
  }
}
