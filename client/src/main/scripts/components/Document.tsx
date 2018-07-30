import * as React from "react";
import { FoundationNode } from "../utils/functions";
import DocumentTextNodeList from "./DocumentTextNodeList";

export interface DocumentEventHandlers {
  onMouseUp: () => any;
}

interface DocumentProps {
  eventHandlers: DocumentEventHandlers;
  nodes: FoundationNode[];
  className?: string;
}

interface DocumentState {}

class Document extends React.Component<DocumentProps, DocumentState> {
  constructor(props: DocumentProps) {
    super(props);
  }
  getDocumentNodes = () => {
    return [...this.props.nodes];
  };
  render() {
    let classes = "document document--static";
    let documentClass = this.props.className
      ? this.props.className
      : "document__row";

    return (
      <div className={classes}>
        <div className={documentClass}>
          <div className={"document__row-inner"}>
            <DocumentTextNodeList
              className="document__text"
              onMouseUp={this.props.eventHandlers.onMouseUp}
              documentNodes={this.props.nodes}
            />
            {this.props.children ? this.props.children : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Document;
