import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode, isCaptionNode } from "../../utils/functions";

interface DataAttributes {
  "data-offset": number;
  "data-start"?: number;
  "data-end"?: number;
}
interface DocumentTextNodeProps {
  documentNode: FoundationNode;
}

interface DocumentTextNodeState {}

class DocumentTextNode extends React.Component<
  DocumentTextNodeProps,
  DocumentTextNodeState
> {
  constructor(props: DocumentTextNodeProps) {
    super(props);
  }
  render() {
    const { documentNode } = this.props;

    let attributes: DataAttributes = {
      "data-offset": documentNode.props.offset
    };

    if (isCaptionNode(documentNode.props)) {
      attributes = {
        ...attributes,
        "data-start": documentNode.props.start,
        "data-end": documentNode.props.end
      };
    }
    switch (documentNode.component) {
      case "h2":
        return (
          <h2 {...attributes}>
            {documentNode.innerHTML}
          </h2>
        );
      case "h3":
        return (
          <h3 {...attributes}>
            {documentNode.innerHTML}
          </h3>
        );
      case "p":
        return (
          <p {...attributes}>
            {documentNode.innerHTML}
          </p>
        );
      default:
        // Unknown element, silently throw error here
        return <div />;
    }
  }
}

export default DocumentTextNode;
