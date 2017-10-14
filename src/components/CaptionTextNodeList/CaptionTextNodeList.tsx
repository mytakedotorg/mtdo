import * as React from "react";
import * as ReactDOM from "react-dom";
import { CaptionNode } from "../../utils/functions";
import { CaptionWord } from "../../utils/databaseData";
import CaptionTextNode from "../CaptionTextNode";

interface CaptionTextNodeListProps {
  className: string;
  onMouseUp: () => void;
  captionTimer: number;
  documentNodes: CaptionNode[];
  captionWordMap: CaptionWord[];
}

interface CaptionTextNodeListState {
  currentCaptionIndex: number;
}

class CaptionTextNodeList extends React.Component<
  CaptionTextNodeListProps,
  CaptionTextNodeListState
> {
  private scrollWindow: HTMLDivElement;
  constructor(props: CaptionTextNodeListProps) {
    super(props);

    this.state = {
      currentCaptionIndex: 0
    };
  }
  setScrollView = () => {
    if (this.props.captionTimer) {
      const currentIndex = this.state.currentCaptionIndex;
      const timer = this.props.captionTimer;
      const elementList = this.scrollWindow.querySelectorAll("[data-start]");

      for (let i = 0; i < elementList.length; i++) {
        const data = elementList[i].getAttribute("data-start");
        if (data) {
          if (elementList[i + 1]) {
            const nextData = elementList[i + 1].getAttribute("data-start");
            if (nextData) {
              let startTime = parseInt(data);
              let nextStartTime = parseInt(nextData);

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
    prevProps: CaptionTextNodeListProps,
    prevState: CaptionTextNodeListState
  ) {
    if (
      this.props.captionTimer &&
      prevProps.captionTimer !== this.props.captionTimer
    ) {
      this.setScrollView();
    }
  }
  render() {
    let wordCount: number;
    let nextWordCount: number;
    return (
      <div
        className={this.props.className}
        onMouseUp={this.props.onMouseUp}
        ref={(scrollWindow: HTMLDivElement) =>
          (this.scrollWindow = scrollWindow)}
      >
        {this.props.documentNodes.map(
          function(element: CaptionNode, index: number) {
            if (index === 0) {
              wordCount = 0;
              nextWordCount = 0;
            }

            wordCount = nextWordCount;
            let splitString = element.innerHTML.toString().split(/[\s]+/); //Assumes no white space at start of string
            nextWordCount += splitString.length;

            return (
              <CaptionTextNode
                key={index.toString()}
                documentNode={element}
                wordCount={wordCount}
                captionWordMap={this.props.captionWordMap}
              />
            );
          }.bind(this)
        )}
      </div>
    );
  }
}

export default CaptionTextNodeList;
