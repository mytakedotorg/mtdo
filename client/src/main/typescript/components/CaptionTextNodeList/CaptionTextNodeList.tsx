import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode } from "../../utils/functions";
import { CaptionWord, CaptionMeta, SpeakerMap } from "../../utils/databaseData";
import CaptionTextNode from "../CaptionTextNode";
var bs = require("binary-search");

interface CaptionTextNodeListProps {
  className: string;
  onMouseUp: () => void;
  captionTimer: number;
  documentNodes: FoundationNode[];
  captionWordMap: CaptionWord[];
  captionMeta: CaptionMeta;
}

interface CaptionTextNodeListState {
  currentSpeaker: string;
}

class CaptionTextNodeList extends React.Component<
  CaptionTextNodeListProps,
  CaptionTextNodeListState
> {
  private captionNodeContainer: HTMLDivElement | null;
  private timerId: number | null;
  constructor(props: CaptionTextNodeListProps) {
    super(props);

    this.state = {
      currentSpeaker: "-"
    };
  }
  clearTimer = () => {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
      // Call it one more time to be sure the result is correct when the user scroll has stopped.
      this.handleScroll();
    }
  };
  handleScroll = () => {
    // Only allow this function to execute no more than twice per second
    if (!this.timerId && this.captionNodeContainer) {
      const parentTop = this.captionNodeContainer.scrollTop;
      if (parentTop === 0) {
        this.setState({
          currentSpeaker: "-"
        });
      } else {
        let speakerIdx = bs(
          this.captionNodeContainer.children,
          parentTop,
          (child: HTMLDivElement, parentTop: number) => {
            return child.offsetTop - parentTop;
          }
        );

        if (speakerIdx < 0) {
          speakerIdx = -speakerIdx - 2;
          if (speakerIdx < 0) {
            // If still negative, it means we're at the first node
            speakerIdx = 0;
          }
        }

        this.setState({
          currentSpeaker: this.props.captionMeta.speakerMap[speakerIdx].speaker
        });

        this.timerId = window.setTimeout(this.clearTimer, 500);
      }
    }
  };
  setScrollView = () => {
    if (this.captionNodeContainer) {
      const timer = this.props.captionTimer;

      let wordIdx = bs(
        this.props.captionWordMap,
        timer,
        (word: CaptionWord, time: number) => {
          return word.timestamp - time;
        }
      );

      // usually the timestamp is between two words, in which case it returns (-insertionPoint - 2)
      if (wordIdx < 0) {
        wordIdx = -wordIdx - 2;
      }

      // find the speaker for that word
      let speakerIdx = bs(
        this.props.captionMeta.speakerMap,
        wordIdx,
        (speaker: SpeakerMap, idx: number) => {
          return speaker.range[0] - idx;
        }
      );
      if (speakerIdx < 0) {
        speakerIdx = -speakerIdx - 2;
        if (speakerIdx < 0) {
          // If still negative, it means we're at the first node
          speakerIdx = 0;
        }
      }

      let speakerRange = this.props.captionMeta.speakerMap[speakerIdx];
      const captionTextContainer = this.captionNodeContainer.children[
        speakerIdx
      ].children[1];
      let hiddenTextElement;
      // This lookup should match the DOM structure of CaptionTextNode
      if (captionTextContainer && captionTextContainer.children[1]) {
        hiddenTextElement = captionTextContainer.children[1];
      } else {
        throw "Couldn't find caption node at index " + speakerIdx;
      }

      let height = 0;
      let numberOfLines = -1;
      hiddenTextElement.innerHTML = "";
      for (let i = speakerRange.range[0]; i < wordIdx; ++i) {
        hiddenTextElement.innerHTML += this.props.captionWordMap[i].word;
        if (hiddenTextElement.clientHeight !== height) {
          height = hiddenTextElement.clientHeight;
          numberOfLines++;
        }
      }

      const speakerNameHeight = this.captionNodeContainer.children[speakerIdx]
        .children[0].clientHeight;
      let totalSpeakerHeight;
      if (speakerNameHeight === 31) {
        // Large screen, margin-bottom is 24px;
        totalSpeakerHeight = 55;
      } else {
        // Small screen, margin-bottom is 19px;
        totalSpeakerHeight = 43;
      }

      // Get the offsetTop value of the child element.
      // The line height is 25px, so add 25 for each
      // time the line has wrapped, which is equal to
      // the value of the `idx` variable.
      // Add the height and margin of the speaker name
      const childTop =
        (this.captionNodeContainer.children[speakerIdx] as HTMLElement)
          .offsetTop +
        25 * numberOfLines +
        totalSpeakerHeight;

      // Set the parent container's scrollTop value to the offsetTop
      this.captionNodeContainer.scrollTop = childTop;
    }
  };
  componentDidMount() {
    this.setScrollView();
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
    if (
      this.props.captionMeta.speakerMap.length !==
      this.props.documentNodes.length
    ) {
      throw "Speaker map length not equal to number of caption nodes.";
    }
    const speakerMap = this.props.captionMeta.speakerMap;
    return (
      <div className="document__text">
        <h3 className="document__node-text document__node-text--speaker-top">
          {this.state.currentSpeaker}
        </h3>
        <div
          className={this.props.className}
          onMouseUp={this.props.onMouseUp}
          ref={(captionNodeContainer: HTMLDivElement) =>
            (this.captionNodeContainer = captionNodeContainer)}
          onScroll={this.handleScroll}
        >
          {this.props.documentNodes.map(function(
            element: FoundationNode,
            index: number
          ) {
            return (
              <CaptionTextNode
                key={element.offset}
                documentNode={element}
                speaker={speakerMap[index].speaker}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default CaptionTextNodeList;
