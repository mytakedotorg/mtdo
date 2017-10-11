import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import { getNodeArray, FoundationNode } from "../../utils/functions";
import DocumentTextNodeList from "../DocumentTextNodeList";

interface DocumentProps {
  onMouseUp: () => void;
  excerptId: string;
  className?: string;
  captionTimer?: number;
  nodes?: FoundationNode[];
}

interface DocumentState {
  documentNodes: FoundationNode[];
}

class Document extends React.Component<DocumentProps, DocumentState> {
  constructor(props: DocumentProps) {
    super(props);

    this.state = {
      documentNodes: this.props.nodes
        ? this.props.nodes
        : getNodeArray(props.excerptId)
    };
  }
  getDocumentNodes = () => {
    return [...this.state.documentNodes];
  };

  componentWillReceiveProps(nextProps: DocumentProps) {
    if (this.props.excerptId !== nextProps.excerptId) {
      this.setState({
        documentNodes: getNodeArray(nextProps.excerptId)
      });
    }
    if (
      !_.isEqual(this.state.documentNodes, nextProps.nodes) &&
      nextProps.nodes !== undefined
    ) {
      this.setState({
        documentNodes: nextProps.nodes
      });
    }
  }
  render() {
    let classes = "document document--static";
    let documentClass = this.props.className
      ? this.props.className
      : "document__row";

    let textListClass;
    if (this.props.captionTimer || this.props.captionTimer === 0) {
      textListClass = "document__text document__text--caption";
    } else {
      textListClass = "document__text";
    }

    return (
      <div className={classes}>
        <div className={documentClass}>
          <div className={"document__row-inner"}>
            <DocumentTextNodeList
              className={textListClass}
              onMouseUp={this.props.onMouseUp}
              captionTimer={this.props.captionTimer}
              documentNodes={this.state.documentNodes}
            />
            {this.props.children ? this.props.children : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Document;
