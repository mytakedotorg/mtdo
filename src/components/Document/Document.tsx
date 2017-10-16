import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import {
  getNodeArray,
  getCaptionNodeArray,
  FoundationNode
} from "../../utils/functions";
import { CaptionWord } from "../../utils/databaseData";
import DocumentTextNodeList from "../DocumentTextNodeList";
import CaptionTextNodeList from "../CaptionTextNodeList";

interface CaptionData {
  captionTimer: number;
  captionMap: CaptionWord[];
}

interface DocumentProps {
  onMouseUp: () => void;
  excerptId: string;
  className?: string;
  nodes?: FoundationNode[];
  captionData?: CaptionData;
}

interface DocumentState {
  documentNodes: FoundationNode[];
}

class Document extends React.Component<DocumentProps, DocumentState> {
  constructor(props: DocumentProps) {
    super(props);

    let nodes: FoundationNode[];
    if (!props.nodes) {
      if (props.captionData) {
        nodes = getCaptionNodeArray(props.excerptId);
      } else {
        nodes = getNodeArray(props.excerptId);
      }
    } else {
      nodes = props.nodes;
    }

    this.state = {
      documentNodes: nodes
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

    let childComponent;
    if (this.props.captionData) {
      childComponent = (
        <CaptionTextNodeList
          className="document__text document__text--caption"
          onMouseUp={this.props.onMouseUp}
          documentNodes={this.state.documentNodes}
          captionTimer={this.props.captionData.captionTimer}
          captionWordMap={this.props.captionData.captionMap}
        />
      );
    } else {
      childComponent = (
        <DocumentTextNodeList
          className="document__text"
          onMouseUp={this.props.onMouseUp}
          documentNodes={this.state.documentNodes}
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
