import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import { getNodeArray, FoundationNode } from "../../utils/functions";

interface DocumentProps {
  onMouseUp: () => void;
  excerptId: string;
  className?: string;
  captionTimer?: number;
  nodes?: FoundationNode[];
}

interface DocumentState {
  documentNodes: FoundationNode[];
  currentCaptionIndex: number;
}

class Document extends React.Component<DocumentProps, DocumentState> {
  private scrollWindow: HTMLDivElement;
  constructor(props: DocumentProps) {
    super(props);

    this.state = {
      documentNodes: this.props.nodes
        ? this.props.nodes
        : getNodeArray(props.excerptId),
      currentCaptionIndex: 0
    };
  }
  getDocumentNodes = () => {
    return [...this.state.documentNodes];
  };
  setScrollView = () => {
    if (this.props.captionTimer) {
      const currentIndex = this.state.currentCaptionIndex;
      const timer = this.props.captionTimer;
      const elementList = this.scrollWindow.querySelectorAll("[data]");

      for (let i = 0; i < elementList.length; i++) {
        const data = elementList[i].getAttribute("data");
        if (data) {
          if (elementList[i + 1]) {
            const nextData = elementList[i + 1].getAttribute("data");
            if (nextData) {
              let startTime = parseInt(data.split("|")[0]);
              let nextStartTime = parseInt(nextData.split("|")[0]);

              if (
                startTime <= timer &&
                timer < nextStartTime &&
                currentIndex !== i
              ) {
                let parentTop = this.scrollWindow.getBoundingClientRect().top;
                let childTop;
                if (elementList[i - 1]) {
                  childTop =
                    elementList[i - 1].getBoundingClientRect().top +
                    this.scrollWindow.scrollTop;
                } else {
                  childTop =
                    elementList[i].getBoundingClientRect().top +
                    this.scrollWindow.scrollTop;
                }
                let scrollTop = childTop - parentTop;
                this.scrollWindow.scrollTop = scrollTop;
                this.setState({ currentCaptionIndex: i });
                return;
              }
            }
          }
        }
      }
    }
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
  componentDidMount() {
    if (this.props.captionTimer) {
      this.setScrollView();
    }
  }
  componentDidUpdate(prevProps: DocumentProps, prevState: DocumentState) {
    if (
      this.props.captionTimer &&
      prevProps.captionTimer !== this.props.captionTimer
    ) {
      this.setScrollView();
    }
  }
  render() {
    let classes = "document document--static";
    let documentClass = this.props.className
      ? this.props.className
      : "document__row";

    let captionClass;
    if (this.props.captionTimer || this.props.captionTimer === 0) {
      captionClass = "document__text document__text--caption";
    } else {
      captionClass = "document__text";
    }

    return (
      <div className={classes}>
        <div className={documentClass}>
          <div className={"document__row-inner"}>
            <div
              className={captionClass}
              onMouseUp={this.props.onMouseUp}
              ref={(scrollWindow: HTMLDivElement) =>
                (this.scrollWindow = scrollWindow)}
            >
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
