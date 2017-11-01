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

interface CaptionTextNodeListState {}

class CaptionTextNodeList extends React.Component<
  CaptionTextNodeListProps,
  CaptionTextNodeListState
> {
  private captionNodeContainer: HTMLDivElement;
  constructor(props: CaptionTextNodeListProps) {
    super(props);
  }
  setScrollView = () => {
    if (this.props.captionTimer) {
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
      let hiddenTextElement;
      // This lookup should match the DOM structure of CaptionTextNode
      if (
        this.captionNodeContainer.children[speakerIdx] &&
        this.captionNodeContainer.children[speakerIdx].children[1]
      ) {
        hiddenTextElement = this.captionNodeContainer.children[speakerIdx]
          .children[1].children[0];
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

      // scroll to here
      let parentTop = this.captionNodeContainer.getBoundingClientRect().top;

      // Get the offsetTop value of the child element.
      // The line height is 25px, so add 25 for each
      // time the line has wrapped, which is equal to
      // the value of the `idx` variable
      let childTop =
        (this.captionNodeContainer.children[speakerIdx] as HTMLElement)
          .offsetTop +
        25 * numberOfLines;

      // Set the parent container's scrollTop value to the offsetTop
      this.captionNodeContainer.scrollTop = childTop;
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
        {this.props.documentNodes.map(function(
          element: FoundationNode,
          index: number
        ) {
          return (
            <CaptionTextNode
              key={element.props.offset}
              documentNode={element}
            />
          );
        })}
      </div>
    );
  }
}

export default CaptionTextNodeList;
