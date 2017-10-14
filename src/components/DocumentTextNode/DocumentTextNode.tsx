import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode } from "../../utils/functions";

interface DataAttributes {
  "data-offset": number;
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
