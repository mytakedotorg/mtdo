import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode } from "../../utils/functions";

interface DataAttributes {
  "data-char-offset": number;
}

interface CaptionTextNodeProps {
  documentNode: FoundationNode;
  speaker: string;
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
      "data-char-offset": documentNode.offset
    };
    return (
      <div className="document__node">
        <h3 className="document__node-text document__node-text--speaker">
          {this.props.speaker}
        </h3>
        <div className="document__node-text-container">
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
      </div>
    );
  }
}

export default CaptionTextNode;
