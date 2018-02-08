import * as React from "react";
import * as ReactDOM from "react-dom";
import { alertErr, FoundationNode } from "../utils/functions";
import NumberLineTransform from "../utils/numberLineTransform";
import { Foundation } from "../java2ts/Foundation";
import CaptionTextNode from "./CaptionTextNode";
import { TimeRange } from "./Video";
import isEqual = require("lodash/isEqual");
var bs = require("binary-search");

export interface CaptionTextNodeListEventHandlers {
  onMouseUp: () => any;
  onScroll: (viewRangeStart: number) => any;
}

interface CaptionTextNodeListProps {
  captionTimer: number;
  captionTranscript: Foundation.CaptionWord[];
  className: string;
  documentNodes: FoundationNode[];
  eventHandlers: CaptionTextNodeListEventHandlers;
  speakerMap: Foundation.SpeakerMap[];
  view: TimeRange;
}

interface CaptionTextNodeListState {
  currentSpeaker: string;
  wordAtViewStart: Foundation.CaptionWord;
}

class CaptionTextNodeList extends React.Component<
  CaptionTextNodeListProps,
  CaptionTextNodeListState
> {
  private captionNodeContainer: HTMLDivElement | null;
  private timerId: number | null;
  private lineHeight: number;
  constructor(props: CaptionTextNodeListProps) {
    super(props);

    this.lineHeight = 25.5;

    this.state = {
      currentSpeaker: "-",
      wordAtViewStart: props.captionTranscript[0]
    };
  }
  clearTimer = () => {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
      // Call it one more time to be sure the result is correct when the user scroll has stopped.
      this.getCurrentSpeaker();
    }
  };
  getHiddenDiv = (documentNode: Element): Element => {
    // Find the hidden div element
    const captionTextContainer = documentNode.children[1];
    let hiddenTextElement;
    // This lookup should match the DOM structure of CaptionTextNode
    if (captionTextContainer && captionTextContainer.children[1]) {
      hiddenTextElement = captionTextContainer.children[1];
    } else {
      const msg = "CaptionTextNodeList: Couldn't find caption node";
      alertErr(msg);
      throw msg;
    }

    return hiddenTextElement;
  };
  getCurrentSpeaker = () => {
    if (this.captionNodeContainer) {
      const parentTop = this.captionNodeContainer.scrollTop;
      if (parentTop === 0) {
        this.getViewRange(0);
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

        this.getViewRange(speakerIdx);

        this.setState({
          currentSpeaker: this.props.speakerMap[speakerIdx].speaker
        });
      }
    }
  };
  getParagraphEl = (documentNode: Element): Element => {
    // Find the paragraph element
    const captionTextContainer = documentNode.children[1];
    let paragraphElement;
    // This lookup should match the DOM structure of CaptionTextNode
    if (captionTextContainer && captionTextContainer.children[0]) {
      paragraphElement = captionTextContainer.children[0];
    } else {
      const msg =
        "CaptionTextNodeList: Couldn't find paragraph inside caption node";
      alertErr(msg);
      throw msg;
    }

    return paragraphElement;
  };
  getViewRange = (speakerIdx: number) => {
    if (this.captionNodeContainer) {
      // Document node currently in the scroll view
      let documentNode = this.captionNodeContainer.children[speakerIdx];

      // Calculate the total height of the speaker inside the document node
      const speakerNameHeight = documentNode.children[0].clientHeight;
      let totalSpeakerHeight;
      const lineHeight = this.lineHeight;
      if (speakerNameHeight === 31) {
        // Large screen, margin-bottom is 24px;
        totalSpeakerHeight = 55;
      } else {
        // Small screen, margin-bottom is 19px;
        totalSpeakerHeight = 43;
      }

      // Get the scroll offset of the paragraph text inside the document node relative to the scroll view
      const parentTop = this.captionNodeContainer.scrollTop;
      const scrollHeight =
        (documentNode as HTMLDivElement).offsetTop -
        parentTop +
        totalSpeakerHeight;

      // Get the number of lines we have scrolled into the paragraph
      const numberOfLinesIntoParagraph =
        Math.floor(scrollHeight / lineHeight) * -1;

      // Get the height of the current paragraph
      const paragraphElement = this.getParagraphEl(documentNode);
      const height = paragraphElement.clientHeight;

      // Calculate the number of lines in it based on the lineHeight
      const totalLinesInParagraph = Math.ceil(height / this.lineHeight);

      // Get the speakerMap
      let speakerMap = this.props.speakerMap[speakerIdx];
      // Create a number line transform of number of lines in the paragraph to word index in speakerMap
      const numberLineTransform = new NumberLineTransform();
      numberLineTransform.setBefore(0, totalLinesInParagraph);
      numberLineTransform.setAfter(speakerMap.range[0], speakerMap.range[1]);
      const approximateWordIdx = Math.round(
        numberLineTransform.toAfter(numberOfLinesIntoParagraph)
      );

      // Find the index of the first word
      const indexOfFirstWord = approximateWordIdx;
      const firstWord = this.props.captionTranscript[indexOfFirstWord];

      if (typeof firstWord != "undefined") {
        this.setState({
          wordAtViewStart: firstWord
        });
        this.props.eventHandlers.onScroll(firstWord.timestamp);
      }
    }
  };
  handleScroll = () => {
    // Only allow this function to execute no more than twice per second
    if (!this.timerId) {
      this.getCurrentSpeaker();
      this.timerId = window.setTimeout(this.clearTimer, 50);
    }
  };
  isCloseTo = (n0: number, n1: number, margin: number): boolean => {
    const difference = Math.abs(n0 - n1);
    if (difference <= margin) {
      return true;
    } else {
      return false;
    }
  };
  setScrollView = (time?: number) => {
    if (this.captionNodeContainer) {
      const timer = time ? time : this.props.captionTimer;

      let wordIdx = bs(
        this.props.captionTranscript,
        timer,
        (word: Foundation.CaptionWord, time: number) => {
          return word.timestamp - time;
        }
      );

      // usually the timestamp is between two words, in which case it returns (-insertionPoint - 2)
      if (wordIdx < 0) {
        wordIdx = -wordIdx - 2;
      }

      // find the speaker for that word
      let speakerIdx = bs(
        this.props.speakerMap,
        wordIdx,
        (speaker: Foundation.SpeakerMap, idx: number) => {
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

      let speakerRange = this.props.speakerMap[speakerIdx];
      const captionTextContainer = this.captionNodeContainer.children[
        speakerIdx
      ].children[1];
      let hiddenTextElement;
      // This lookup should match the DOM structure of CaptionTextNode
      if (captionTextContainer && captionTextContainer.children[1]) {
        hiddenTextElement = captionTextContainer.children[1];
      } else {
        alertErr(
          "CaptionTextNodeList: Couldn't find caption node at index " +
            speakerIdx
        );
        throw "Couldn't find caption node at index " + speakerIdx;
      }

      let height = 0;
      let numberOfLines = -1;
      hiddenTextElement.innerHTML = "";
      for (let i = speakerRange.range[0]; i < wordIdx; ++i) {
        hiddenTextElement.innerHTML += this.props.captionTranscript[i].word;
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
  componentWillReceiveProps(nextProps: CaptionTextNodeListProps) {
    if (
      !this.isCloseTo(
        nextProps.view.start,
        this.state.wordAtViewStart.timestamp,
        5
      )
    ) {
      // If our next prop is close to our current state, don't scroll.
      // It's also likely the number nextProps.view.start was set by
      // the callback in this.getViewRange anyway.
      this.setScrollView(nextProps.view.start);
    }
  }
  render() {
    let wordCount: number;
    let nextWordCount: number;
    if (this.props.speakerMap.length !== this.props.documentNodes.length) {
      alertErr(
        "CaptionTextNodeList: Speaker map length not equal to number of caption nodes."
      );
      throw "Speaker map length not equal to number of caption nodes.";
    }
    const speakerMap = this.props.speakerMap;
    return (
      <div className="document__text">
        <h3 className="document__node-text document__node-text--speaker-top">
          {this.state.currentSpeaker}
        </h3>
        <div
          className={this.props.className}
          onMouseUp={this.props.eventHandlers.onMouseUp}
          ref={(captionNodeContainer: HTMLDivElement) =>
            (this.captionNodeContainer = captionNodeContainer)
          }
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
