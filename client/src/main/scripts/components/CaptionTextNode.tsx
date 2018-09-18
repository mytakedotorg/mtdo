import * as React from "react";
import { CaptionNode, CaptionNodeArr } from "../utils/CaptionNodes";

interface CaptionTextNodeProps {
  documentNode: CaptionNode | CaptionNodeArr;
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

    let innerHTML: any = [];

    if (typeof documentNode === "object") {
      for (const subNode of documentNode as Array<CaptionNode>) {
        innerHTML.push(subNode);
      }
    } else {
      innerHTML = documentNode;
    }

    return (
      <div className="document__node">
        <h3 className="document__node-text document__node-text--speaker">
          {this.props.speaker}
        </h3>
        <div className="document__node-text-container">
          <p className="document__node-text document__node-text--p">
            {innerHTML}
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
