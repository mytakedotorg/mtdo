import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  FoundationNode,
  convertTimestampToSeconds
} from "../../utils/functions";
import { CaptionWord } from "../../utils/databaseData";
import CaptionTextNode, { ScrollData } from "../CaptionTextNode";

interface CaptionTextNodeListProps {
  className: string;
  onMouseUp: () => void;
  captionTimer: number;
  documentNodes: FoundationNode[];
  captionWordMap: CaptionWord[];
}

interface CaptionTextNodeListState {
  currentCaptionIndex: [number, number]; // ElementListIdx, ElementListItemIdx
}

class CaptionTextNodeList extends React.Component<
  CaptionTextNodeListProps,
  CaptionTextNodeListState
> {
  private captionNodeContainer: HTMLDivElement;
  constructor(props: CaptionTextNodeListProps) {
    super(props);

    this.state = {
      currentCaptionIndex: [0, 0]
    };
  }
  setScrollView = () => {
    if (this.props.captionTimer) {
      const currentIndex = this.state.currentCaptionIndex;
      const timer = this.props.captionTimer;
      const elementList = this.captionNodeContainer.querySelectorAll(
        "[data-map]"
      );

      for (let i = 0; i < elementList.length; i++) {
        const dataMapAttribute = elementList[i].getAttribute("data-map");
        if (dataMapAttribute) {
          const dataMap: ScrollData[] = JSON.parse(dataMapAttribute);
          for (let idx = 0; idx < dataMap.length; idx++) {
            let startTime = dataMap[idx][1];
            let nextStartTime;
            if (dataMap[idx + 1]) {
              // Next scroll index is in current paragraph
              nextStartTime = dataMap[idx + 1][1];
            } else if (elementList[i + 1]) {
              // Next scroll index is in next paragraph
              const nextDataMapAttribute = elementList[i + 1].getAttribute(
                "data-map"
              );
              if (nextDataMapAttribute) {
                const nextDataMap: ScrollData[] = JSON.parse(
                  nextDataMapAttribute
                );
                if (nextDataMap && nextDataMap[0][1]) {
                  nextStartTime = nextDataMap[0][1];
                }
              }
            }
            if (nextStartTime) {
              if (
                startTime <= timer &&
                timer < nextStartTime &&
                (currentIndex[0] !== i || currentIndex[1] !== idx)
              ) {
                // scroll to here
                let parentTop = this.captionNodeContainer.getBoundingClientRect()
                  .top;

                // Get the offsetTop value of the child element.
                // The line height is 25px, so add 25 for each
                // time the line has wrapped, which is equal to
                // the value of the `idx` variable
                let childTop =
                  (this.captionNodeContainer.children[i] as HTMLElement)
                    .offsetTop +
                  25 * idx;

                // Set the parent container's scrollTop value to the offsetTop
                this.captionNodeContainer.scrollTop = childTop;

                // Set the state to hold the current index pair
                this.setState({ currentCaptionIndex: [i, idx] });
                return;
              }
            } else {
              // Reached the end of the scroll container
              return;
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
        ref={(captionNodeContainer: HTMLDivElement) =>
          (this.captionNodeContainer = captionNodeContainer)}
      >
        {this.props.documentNodes.map(
          function(element: FoundationNode, index: number) {
            if (index === 0) {
              wordCount = 0;
              nextWordCount = 0;
            }

            wordCount = nextWordCount;
            let splitString = element.innerHTML.toString().split(/[\s]+/); //Assumes no white space at start of string
            nextWordCount += splitString.length;

            return (
              <CaptionTextNode
                key={element.props.offset}
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
