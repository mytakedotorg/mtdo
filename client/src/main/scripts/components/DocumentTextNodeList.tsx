import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode } from "../utils/functions";
import DocumentTextNode from "./DocumentTextNode";

interface DocumentTextNodeListProps {
  className?: string;
  onMouseUp?: () => void;
  documentNodes: FoundationNode[];
}

interface DocumentTextNodeListState {}

class DocumentTextNodeList extends React.Component<
  DocumentTextNodeListProps,
  DocumentTextNodeListState
> {
  private scrollWindow: HTMLDivElement;
  constructor(props: DocumentTextNodeListProps) {
    super(props);
  }
  render() {
    return (
      <div
        className={this.props.className}
        onMouseUp={this.props.onMouseUp}
        ref={(scrollWindow: HTMLDivElement) =>
          (this.scrollWindow = scrollWindow)}
      >
        {this.props.documentNodes.map(function(
          element: FoundationNode,
          index: number
        ) {
          return (
            <DocumentTextNode key={index.toString()} documentNode={element} />
          );
        })}
      </div>
    );
  }
}

export default DocumentTextNodeList;
