import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode } from "../../utils/functions";
import DocumentTextNode from "../DocumentTextNode";

interface DocumentTextNodeListProps {
  className?: string;
  onMouseUp?: () => void;
  captionTimer?: number;
  documentNodes: FoundationNode[];
}

interface DocumentTextNodeListState {
  currentCaptionIndex: number;
}

class DocumentTextNodeList extends React.Component<
  DocumentTextNodeListProps,
  DocumentTextNodeListState
> {
  private scrollWindow: HTMLDivElement;
  constructor(props: DocumentTextNodeListProps) {
    super(props);

    this.state = {
      currentCaptionIndex: 0
    };
  }
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
  componentDidMount() {
    if (this.props.captionTimer) {
      this.setScrollView();
    }
  }
  componentDidUpdate(
    prevProps: DocumentTextNodeListProps,
    prevState: DocumentTextNodeListState
  ) {
    if (
      this.props.captionTimer &&
      prevProps.captionTimer !== this.props.captionTimer
    ) {
      this.setScrollView();
    }
  }
  render() {
    return (
      <div
        className={this.props.className}
        onMouseUp={this.props.onMouseUp}
        ref={(scrollWindow: HTMLDivElement) =>
          (this.scrollWindow = scrollWindow)}
      >
        {this.props.documentNodes.map(function(
          element: FoundationNode,
          index: number
        ) {
          return (
            <DocumentTextNode key={index.toString()} documentNode={element} />
          );
        })}
      </div>
    );
  }
}

export default DocumentTextNodeList;
