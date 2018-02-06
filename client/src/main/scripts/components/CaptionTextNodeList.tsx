import * as React from "react";
import * as ReactDOM from "react-dom";
import { alertErr, FoundationNode } from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";
import CaptionTextNode from "./CaptionTextNode";
import isEqual = require("lodash/isEqual");
var bs = require("binary-search");

export interface CaptionTextNodeListEventHandlers {
  onMouseUp: () => any;
  onScroll: (viewRange: [number, number]) => any;
}

interface CaptionTextNodeListProps {
  captionTimer: number;
  captionTranscript: Foundation.CaptionWord[];
  className: string;
  documentNodes: FoundationNode[];
  eventHandlers: CaptionTextNodeListEventHandlers;
  speakerMap: Foundation.SpeakerMap[];
  view: [number, number];
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
      this.getCurrentSpeaker();
    }
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
  getIdxOfFirstWord = (
    hiddenDiv: Element,
    speakerMap: Foundation.SpeakerMap,
    lineAtViewTop: number
  ): number => {
    let height = 0;
    let indexOfFirstWord;
    let numberOfLinesIntoDiv = -1;
    let numberOfLinesIntoView = 0;
    hiddenDiv.innerHTML = "";
    for (let i = speakerMap.range[0]; i <= speakerMap.range[1]; ++i) {
      hiddenDiv.innerHTML += this.props.captionTranscript[i].word;
      if (hiddenDiv.clientHeight !== height) {
        if (numberOfLinesIntoView > 0) {
          numberOfLinesIntoView++;
        } else {
          height = hiddenDiv.clientHeight;
          numberOfLinesIntoDiv++;
          if (numberOfLinesIntoDiv === lineAtViewTop) {
            // We found the index of the first word in the scroll view
            indexOfFirstWord = i;
            numberOfLinesIntoView++;
            break;
          }
        }
      }
    }
    return typeof indexOfFirstWord != "undefined" ? indexOfFirstWord : -1;
  };
  getIdxOfLastWord = (
    hiddenDiv: Element,
    speakerMap: Foundation.SpeakerMap,
    additionalHeight: number,
    wordsSoFar: number
  ): { idx: number; height: number } => {
    const totalViewHeight = 200;
    let height = 0;
    let indexOfLastWord;
    hiddenDiv.innerHTML = "";
    for (let i = speakerMap.range[0]; i <= speakerMap.range[1]; ++i) {
      hiddenDiv.innerHTML += this.props.captionTranscript[i].word;
      if (hiddenDiv.clientHeight !== height) {
        height = hiddenDiv.clientHeight;
        const total = height + additionalHeight;
        if (height + additionalHeight >= totalViewHeight) {
          // We found the index of the last word in the scroll view
          indexOfLastWord = i + wordsSoFar - 1;
          break;
        }
      }
    }

    if (typeof indexOfLastWord != "undefined") {
      return {
        idx: indexOfLastWord,
        height: height
      };
    } else {
      return {
        idx: -1,
        height: height
      };
    }
  };
  getViewRange = (speakerIdx: number) => {
    if (this.captionNodeContainer) {
      // Document node currently in the scroll view
      let documentNode = this.captionNodeContainer.children[speakerIdx];

      // Calculate the total height of the speaker inside the document node
      const speakerNameHeight = documentNode.children[0].clientHeight;
      let totalSpeakerHeight;
      const lineHeight = 25.5;
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

      let hiddenTextElement = this.getHiddenDiv(documentNode);

      // Add text to the hidden div element one line at a time
      const speakerMap = this.props.speakerMap[speakerIdx];
      let indexOfFirstWord = this.getIdxOfFirstWord(
        hiddenTextElement,
        speakerMap,
        numberOfLinesIntoParagraph
      );

      // If we didn't find the index, then we might have gone too far
      while (indexOfFirstWord === -1) {
        if (speakerIdx > 0) {
          speakerIdx--;
          // Do it again for the previous speaker
          const prevSpeaker = this.props.speakerMap[speakerIdx];
          documentNode = this.captionNodeContainer.children[speakerIdx];
          hiddenTextElement = this.getHiddenDiv(documentNode);
          indexOfFirstWord = this.getIdxOfFirstWord(
            hiddenTextElement,
            speakerMap,
            numberOfLinesIntoParagraph
          );
        } else {
          // Don't change the scroll view
          indexOfFirstWord = -1;
        }
      }

      if (indexOfFirstWord !== -1) {
        const lastSpeakerMap = this.props.speakerMap[speakerIdx];
        let triesSoFar = 0;
        let wordsSoFar = 0;
        let heightSoFar = 0;
        documentNode = this.captionNodeContainer.children[speakerIdx];
        hiddenTextElement = this.getHiddenDiv(documentNode);
        // let indexOfLastWord = this.getIdxOfLastWord(
        //   hiddenTextElement,
        //   lastSpeakerMap,
        //   0,
        //   0
        // );
        // while (indexOfLastWord.idx === -1) {
        //   wordsSoFar = this.props.speakerMap[speakerIdx].range[1];
        //   speakerIdx++;
        //   let nextSpeakerMap = this.props.speakerMap[speakerIdx];
        //   triesSoFar++;
        //   if (speakerIdx >= this.props.speakerMap.length) {
        //     // We are at the end of the video
        //     throw "TODO";
        //   } else {
        //     heightSoFar +=
        //       indexOfLastWord.height + totalSpeakerHeight * triesSoFar;
        //     documentNode = this.captionNodeContainer.children[speakerIdx];
        //     hiddenTextElement = this.getHiddenDiv(documentNode);
        //     indexOfLastWord = this.getIdxOfLastWord(
        //       hiddenTextElement,
        //       nextSpeakerMap,
        //       heightSoFar,
        //       wordsSoFar
        //     );
        //   }
        // }

        let indexOfLastWord = indexOfFirstWord + 20;

        const { captionTranscript } = this.props;

        if (indexOfLastWord >= captionTranscript.length) {
          indexOfLastWord = captionTranscript.length;
        }

        this.props.eventHandlers.onScroll([
          captionTranscript[indexOfFirstWord].timestamp,
          captionTranscript[indexOfLastWord].timestamp
        ]);
      }
    }
  };
  handleScroll = () => {
    // Only allow this function to execute no more than twice per second
    if (!this.timerId) {
      this.getCurrentSpeaker();
      this.timerId = window.setTimeout(this.clearTimer, 500);
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
    if (!isEqual(this.props.view, nextProps.view)) {
      this.setScrollView(nextProps.view[0]);
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
