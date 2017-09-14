import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode } from "../Foundation";
import database from "../../utils/database";
import {
  getNodeArray,
  highlightText,
  HighlightedText,
  slugify
} from "../../utils/functions";

interface DocumentProps {
  onBackClick: () => void;
  onSetClick: (excerptId: string, highlightedRange: [number, number]) => void;
  viewRange?: [number, number];
  excerptId: string;
}

interface DocumentState {
  documentNodes: FoundationNode[];
  highlightedRange: [number, number];
  textIsHighlighted: boolean;
  highlightedNodes: FoundationNode[];
}

class Document extends React.Component<DocumentProps, DocumentState> {
  constructor(props: DocumentProps) {
    super(props);

    this.state = {
      documentNodes: getNodeArray(props.excerptId),
      highlightedRange: [0, 0],
      textIsHighlighted: false,
      highlightedNodes: []
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
          textIsHighlighted: true
        });
      }
    }
  };
  handleSetClick = (isInitialRange?: boolean) => {
    this.props.onSetClick(this.props.excerptId, this.state.highlightedRange);
  };
  componentWillReceiveProps(nextProps: DocumentProps) {
    if (this.props.excerptId !== nextProps.excerptId) {
      this.setState({
        documentNodes: getNodeArray(nextProps.excerptId)
      });
    }
  }
  render() {
    let classes = "document document--static";
    let documentClass = "document__row";

    return (
      <div className={classes}>
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
          </div>
        </div>
      </div>
    );
  }
}

export default Document;
