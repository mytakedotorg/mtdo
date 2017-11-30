import * as React from "react";
import * as ReactDOM from "react-dom";
import isEqual = require("lodash/isEqual");
import {
  getNodeArray,
  getCaptionNodeArray,
  FoundationNode
} from "../../utils/functions";
import { CaptionWord, CaptionMeta } from "../../utils/databaseData";
import DocumentTextNodeList from "../DocumentTextNodeList";
import CaptionTextNodeList from "../CaptionTextNodeList";

interface CaptionData {
  captionTimer: number;
  captionMap: CaptionWord[];
  captionMeta: CaptionMeta;
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
      throw "TODO";
      // childComponent = (
      //   <CaptionTextNodeList
      //     className="document__text document__text--caption"
      //     onMouseUp={this.props.onMouseUp}
      //     documentNodes={this.props.documentNodes}
      //     captionTimer={this.props.captionData.captionTimer}
      //     captionWordMap={this.props.captionData.captionMap}
      //     captionMeta={this.props.captionData.captionMeta}
      //   />
      // );
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
