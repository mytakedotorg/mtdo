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
  onScroll: (viewRange: [number, number]) => any;
}

interface CaptionTextNodeListProps {
  captionTimer: number;
  className: string;
  documentNodes: FoundationNode[];
  eventHandlers: CaptionTextNodeListEventHandlers;
  videoFact: Foundation.VideoFactContentFast;
  view: TimeRange;
}

interface CaptionTextNodeListState {
  currentSpeaker: string;
  wordTimestampAtViewStart: number;
}

class CaptionTextNodeList extends React.Component<
  CaptionTextNodeListProps,
  CaptionTextNodeListState
> {
  private captionNodeContainer: HTMLDivElement | null;
  private timerId: number | null;
  private lineHeight: number;
  private preventScroll: boolean;
  constructor(props: CaptionTextNodeListProps) {
    super(props);

    this.lineHeight = 25.5;
    this.preventScroll = false;

    this.state = {
      currentSpeaker: "-",
      wordTimestampAtViewStart: 0
    };
  }
  clearTimer = () => {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
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

        if (!this.preventScroll) {
          // is this.preventScroll = true, then we already have the view range
          // from the range slider. Don't calculate it from the text.
          this.getViewRange(speakerIdx);
        } else {
          // Turn scroll event handler back on
          this.preventScroll = false;
        }

        this.setState({
          currentSpeaker: this.props.videoFact.speakers[
            this.props.videoFact.speakerPerson[speakerIdx]
          ].lastname
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
      const scrollHeightTop =
        (documentNode as HTMLDivElement).offsetTop -
        parentTop +
        totalSpeakerHeight;

      // Get the scroll offset of the last line of visible paragraph text inside the document node relative to the scroll view
      const scrollHeightBottom = scrollHeightTop - 200;

      // Get the number of lines we have scrolled into the paragraph
      const numberOfLinesIntoParagraphTop =
        Math.floor(scrollHeightTop / lineHeight) * -1;

      // And the number of lines to the bottom of the view
      const numberOfLinesIntoParagraphBottom =
        Math.floor(scrollHeightBottom / lineHeight) * -1;

      // Get the height of the current paragraph
      const paragraphElement = this.getParagraphEl(documentNode);
      const height = paragraphElement.clientHeight;

      // Calculate the number of lines in it based on the lineHeight
      const totalLinesInParagraph = Math.ceil(height / lineHeight);

      const speakerWordMap = this.props.videoFact.speakerWord;

      // Get the word range of the current speaker
      const idxOfFirstWordInParagraph = speakerWordMap[speakerIdx];
      const idxOfLastWordInParagraph = speakerWordMap[speakerIdx + 1];
      if (!idxOfLastWordInParagraph) {
        // We're at the end
        throw "TODO: we're at the end";
      }

      // Create a number line transform of number of lines in the paragraph to word index in speakerMap
      const numberLineTransform = new NumberLineTransform();

      numberLineTransform.setBefore(0, totalLinesInParagraph);
      numberLineTransform.setAfter(
        idxOfFirstWordInParagraph,
        idxOfLastWordInParagraph
      );

      // Find the index of the first word
      const indexOfFirstWord = Math.round(
        numberLineTransform.toAfter(numberOfLinesIntoParagraphTop)
      );

      // Initialize loop variables
      // Get the height of the first paragraph in the view + the height of the next speaker's name
      let heightOfLinesInView =
        (totalLinesInParagraph - numberOfLinesIntoParagraphTop) * lineHeight + // Height of lines in previous paragraph
        15 + // Margin after previous paragraph
        totalSpeakerHeight; // Height of next speaker
      let loopCounter = 0;
      let indexOfLastWord;
      let totalLinesInNextParagraph = totalLinesInParagraph;
      let numberOfNextLinesInView = numberOfLinesIntoParagraphBottom;
      while (totalLinesInNextParagraph < numberOfNextLinesInView) {
        loopCounter++;
        // There are multiple speakers in the view
        if (heightOfLinesInView > 195) {
          // First line of next speaker isn't visible
          indexOfLastWord = idxOfLastWordInParagraph;
          break;
        } else {
          // Last word is spoken by a new speaker
          // Get the next document node
          documentNode = this.captionNodeContainer.children[speakerIdx + 1];
          if (typeof documentNode === "undefined") {
            // We're at the last speaker anyway
            indexOfLastWord = idxOfLastWordInParagraph;
            throw "TODO: we're at the end. This case has been handled already. Should never execute";
            // break;
          } else {
            const remainingHeight = 200 - heightOfLinesInView;

            // Get the height of the next paragraph
            const nextParagraphElement = this.getParagraphEl(documentNode);
            const heightOfNextParagraph = nextParagraphElement.clientHeight;

            // Calculate the number of lines in it based on the lineHeight
            totalLinesInNextParagraph = Math.ceil(
              heightOfNextParagraph / lineHeight
            );

            numberOfNextLinesInView = Math.floor(remainingHeight / lineHeight);

            if (numberOfNextLinesInView <= totalLinesInNextParagraph) {
              const idxOfFirstWordOfNextSpeaker =
                speakerWordMap[speakerIdx + loopCounter];
              const idxOfLastWordOfNextSpeaker =
                speakerWordMap[speakerIdx + loopCounter + 1];
              if (typeof idxOfLastWordOfNextSpeaker === "undefined") {
                const msg =
                  "CaptionTextNodeList: Couldn't find next speakerWordMap";
                alertErr(msg);
                throw msg;
              }
              // calculate the word idx
              numberLineTransform.setBefore(0, totalLinesInNextParagraph);
              numberLineTransform.setAfter(
                idxOfFirstWordOfNextSpeaker,
                idxOfLastWordOfNextSpeaker
              );
              indexOfLastWord = Math.ceil(
                numberLineTransform.toAfter(numberOfNextLinesInView)
              );
              break;
            }
            heightOfLinesInView +=
              heightOfNextParagraph + 15 + totalSpeakerHeight;
          }
        }
      }

      if (loopCounter === 0) {
        // There is only one speaker in the view
        indexOfLastWord = Math.round(
          numberLineTransform.toAfter(numberOfLinesIntoParagraphBottom)
        );
      }

      if (typeof indexOfLastWord === "undefined") {
        const msg = "CaptionTextNodeList: Couldn't find index of last word";
        alertErr(msg);
        throw msg;
      }

      if (indexOfFirstWord === indexOfLastWord) {
        // Don't let these be the same
        indexOfLastWord += 5;
      }

      const timeOfFirstWord = this.props.videoFact.timestamps[indexOfFirstWord];
      const timeOfLastWord = this.props.videoFact.timestamps[indexOfLastWord];

      if (
        typeof timeOfFirstWord !== "undefined" &&
        typeof timeOfLastWord !== "undefined"
      ) {
        this.setState({
          wordTimestampAtViewStart: timeOfFirstWord
        });
        this.props.eventHandlers.onScroll([timeOfFirstWord, timeOfLastWord]);
      } else {
        const msg = "CaptionTextNodeList: Couldn't find words in view range";
        alertErr(msg);
        throw msg;
      }
    }
  };
  getWord = (wordIdx: number) => {
    const { videoFact } = this.props;
    const transcript = videoFact.plainText;
    const charStart = videoFact.charOffsets[wordIdx];
    const charEnd = videoFact.charOffsets[wordIdx + 1];

    if (charEnd) {
      return transcript.substring(charStart, charEnd);
    } else {
      // last word
      return transcript.substring(
        transcript.lastIndexOf(" "),
        transcript.length
      );
    }
  };
  handleScroll = () => {
    // Only allow this function to execute no more than twice per second
    if (!this.timerId) {
      this.getCurrentSpeaker();
      this.timerId = window.setTimeout(this.clearTimer, 16.67); // 60hz
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
        this.props.videoFact.timestamps, // haystack
        timer, // needle
        (element: number, needle: number) => {
          return element - needle;
        }
      );

      // usually the timestamp is between two words, in which case it returns (-insertionPoint - 2)
      if (wordIdx < 0) {
        wordIdx = -wordIdx - 2;
      }

      // find the speaker for that word
      let speakerIdx = bs(
        this.props.videoFact.speakerWord, // haystack
        wordIdx, // needle
        (element: number, needle: number) => {
          return element - needle;
        }
      );

      if (speakerIdx < 0) {
        speakerIdx = -speakerIdx - 2;
        if (speakerIdx < 0) {
          // If still negative, it means we're at the first node
          speakerIdx = 0;
        }
      }

      // let speakerRange = this.props.speakerMap[speakerIdx];
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
      const speakerWord = this.props.videoFact.speakerWord;
      if (speakerWord[speakerIdx + 1]) {
        for (let i = speakerWord[speakerIdx]; i < wordIdx; i++) {
          hiddenTextElement.innerHTML += this.getWord(i);
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
      } else {
        throw "TODO: last paragraph";
      }
    }
  };
  componentDidMount() {
    this.setScrollView();
  }
  componentWillReceiveProps(nextProps: CaptionTextNodeListProps) {
    // If our next prop is close to our current state, don't scroll.
    if (
      !this.isCloseTo(
        nextProps.view.start,
        this.state.wordTimestampAtViewStart,
        10
      )
    ) {
      // Since we're setting the scrollView this will trigger the onScroll handler
      // which will set the scrollView and trigerr the onScroll handler until
      // nextProps.view.start is close to this.state.wordAtViewStart.timestamp
      // set a flag to prevent this loop of heavy code from executing
      this.preventScroll = true;
      this.setScrollView(nextProps.view.start);
    }
  }
  render() {
    let wordCount: number;
    let nextWordCount: number;
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
          {this.props.documentNodes.map(
            function(element: FoundationNode, index: number) {
              return (
                <CaptionTextNode
                  key={element.offset}
                  documentNode={element}
                  speaker={
                    this.props.videoFact.speakers[
                      this.props.videoFact.speakerPerson[index]
                    ].lastname
                  }
                />
              );
            }.bind(this)
          )}
        </div>
      </div>
    );
  }
}

export default CaptionTextNodeList;
