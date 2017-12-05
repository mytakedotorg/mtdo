import * as React from "react";
import * as ReactDOM from "react-dom";
import isEqual = require("lodash/isEqual");
import {
  getNodeArray,
  getCaptionNodeArray,
  FoundationNode
} from "../../utils/functions";
import { Foundation } from "../../java2ts/Foundation";
import DocumentTextNodeList from "../DocumentTextNodeList";
import CaptionTextNodeList from "../CaptionTextNodeList";

interface CaptionData {
  captionTimer: number;
  transcript: Foundation.CaptionWord[];
  speakerMap: Foundation.SpeakerMap[];
}

interface DocumentProps {
  onMouseUp: () => void;
  nodes: FoundationNode[];
  className?: string;
  captionData?: CaptionData;
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

    let childComponent;
    if (this.props.captionData) {
      childComponent = (
        <CaptionTextNodeList
          className="document__text document__text--caption"
          onMouseUp={this.props.onMouseUp}
          documentNodes={this.props.nodes}
          captionTimer={this.props.captionData.captionTimer}
          captionTranscript={this.props.captionData.transcript}
          speakerMap={this.props.captionData.speakerMap}
        />
      );
    } else {
      childComponent = (
        <DocumentTextNodeList
          className="document__text"
          onMouseUp={this.props.onMouseUp}
          documentNodes={this.props.nodes}
        />
      );
    }

    return (
      <div className={classes}>
        <div className={documentClass}>
          <div className={"document__row-inner"}>
            {childComponent}
            {this.props.children ? this.props.children : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Document;
