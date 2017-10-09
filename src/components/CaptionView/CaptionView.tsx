import * as React from "react";
import * as ReactDOM from "react-dom";
import { getCaptionNodeArray, CaptionNode } from "../../utils/functions";

interface CaptionViewProps {
  timer: number;
}

interface CaptionViewState {
  captionNodes: CaptionNode[];
  currentIndex: number;
}

class CaptionView extends React.Component<CaptionViewProps, CaptionViewState> {
  private scrollWindow: HTMLDivElement;
  constructor(props: CaptionViewProps) {
    super(props);
    this.state = {
      captionNodes: getCaptionNodeArray(),
      currentIndex: 0
    };
  }
  setScrollView = () => {
    const currentIndex = this.state.currentIndex;
    const timer = this.props.timer;
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
              let childTop =
                elementList[i].getBoundingClientRect().top +
                this.scrollWindow.scrollTop;
              let scrollTop = childTop - parentTop;
              this.scrollWindow.scrollTop = scrollTop;
              this.setState({ currentIndex: i });
              return;
            }
          }
        }
      }
    }
  };
  componentDidMount() {
    this.setScrollView();
  }
  componentDidUpdate(prevProps: CaptionViewProps, prevState: CaptionViewState) {
    if (prevProps.timer !== this.props.timer) {
      this.setScrollView();
    }
  }
  render() {
    return (
      <div className="captions">
        <div
          className="captions__scroll-window"
          ref={(scrollWindow: HTMLDivElement) =>
            (this.scrollWindow = scrollWindow)}
        >
          {this.state.captionNodes.map(function(
            element: CaptionNode,
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
      </div>
    );
  }
}

export default CaptionView;
