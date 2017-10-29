import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  FoundationNode,
  convertTimestampToSeconds
} from "../../utils/functions";
import { CaptionWord } from "../../utils/databaseData";

interface DataAttributes {
  "data-char-offset": number;
}

interface CaptionTextNodeProps {
  documentNode: FoundationNode;
}

interface CaptionTextNodeState {}

class CaptionTextNode extends React.Component<
  CaptionTextNodeProps,
  CaptionTextNodeState
> {
  constructor(props: CaptionTextNodeProps) {
    super(props);
  }
  render() {
    const { documentNode } = this.props;

    let attributes: DataAttributes = {
      "data-char-offset": documentNode.props.offset
    };

    switch (documentNode.component) {
      case "h2":
        return (
          <div className="document__node">
            <h2
              className="document__node-text document__node-text--h2"
              {...attributes}
            >
              {documentNode.innerHTML}
            </h2>
            <div className="document__node-height-div">
              <h2 className="document__node-text document__node-text--hidden-h2">
                {documentNode.innerHTML}
              </h2>
            </div>
          </div>
        );
      case "h3":
        return (
          <div className="document__node">
            <h3
              className="document__node-text document__node-text--h3"
              {...attributes}
            >
              {documentNode.innerHTML}
            </h3>
            <div className="document__node-height-div">
              <h3 className="document__node-text document__node-text--hidden-h3">
                {documentNode.innerHTML}
              </h3>
            </div>
          </div>
        );
      case "p":
        return (
          <div className="document__node">
            <p
              className="document__node-text document__node-text--p"
              {...attributes}
            >
              {documentNode.innerHTML}
            </p>
            <div className="document__node-height-div">
              <p className="document__node-text document__node-text--hidden-p" />
            </div>
          </div>
        );
      default:
        // Unknown element, silently throw error here
        return <div />;
    }
  }
}

export default CaptionTextNode;
