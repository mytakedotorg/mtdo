import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode } from "../Foundation";
import { getNodeArray } from "../../utils/functions";

interface DocumentProps {
  onMouseUp: () => void;
  excerptId: string;
}

interface DocumentState {
  documentNodes: FoundationNode[];
}

class Document extends React.Component<DocumentProps, DocumentState> {
  constructor(props: DocumentProps) {
    super(props);

    this.state = {
      documentNodes: getNodeArray(props.excerptId)
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
  }
  render() {
    let classes = "document document--static";
    let documentClass = "document__row";

    return (
      <div className={classes}>
        <div className={documentClass}>
          <div className={"document__row-inner"}>
            <div className={"document__text"} onMouseUp={this.props.onMouseUp}>
              {this.state.documentNodes.map(function(
                element: FoundationNode,
                index: number
              ) {
                element.props["key"] = index.toString();
                return React.createElement(
                  element.component,
                  element.props,
                  element.innerHTML
                );
              })}
            </div>
            {this.props.children ? this.props.children : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Document;
