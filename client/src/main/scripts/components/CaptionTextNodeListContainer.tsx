import * as React from "react";
import * as ReactDOM from "react-dom";
import { alertErr, CaptionNode, CaptionNodeArr } from "../utils/functions";
import NumberLineTransform from "../utils/numberLineTransform";
import { Foundation } from "../java2ts/Foundation";
import CaptionTextNodeList, {
  CaptionTextNodeListEventHandlers
} from "./CaptionTextNodeList";
import { StateAuthority, TimeRange } from "./Video";
import isEqual = require("lodash/isEqual");
var bs = require("binary-search");

export interface CaptionTextNodeListContainerEventHandlers {
  onMouseUp: () => any;
  onScroll: (viewRange: [number, number]) => any;
}

interface CaptionTextNodeListContainerProps {
  captionTimer: number;
  documentNodes: CaptionNodeArr;
  eventHandlers: CaptionTextNodeListContainerEventHandlers;
  stateAuthority: StateAuthority;
  videoFact: Foundation.VideoFactContentFast;
  view: TimeRange;
}

interface CaptionTextNodeListContainerState {
  currentSpeaker: string;
  wordTimestampAtViewStart: number;
}

class CaptionTextNodeListContainer extends React.Component<
  CaptionTextNodeListContainerProps,
  CaptionTextNodeListContainerState
> {
  private captionTextNodeList: CaptionTextNodeList | null;
  private timerId: number | null;
  private lineHeight: number;
  private preventScroll: boolean;
  constructor(props: CaptionTextNodeListContainerProps) {
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
    if (this.captionTextNodeList) {
      let captionNodeContainer = this.captionTextNodeList.getContainer();

      if (captionNodeContainer) {
        const parentTop = captionNodeContainer.scrollTop;
        if (parentTop === 0) {
          this.getViewRange(0);
          this.setState({
            currentSpeaker: "-"
          });
        } else {
          let speakerIdx = bs(
            captionNodeContainer.children,
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
    if (this.captionTextNodeList) {
      let captionNodeContainer = this.captionTextNodeList.getContainer();
      if (captionNodeContainer) {
        // Document node currently in the scroll view
        let documentNode = captionNodeContainer.children[speakerIdx];

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
        const parentTop = captionNodeContainer.scrollTop;
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
          // We're at the end, return the last paragraph
          const timestamps = this.props.videoFact.timestamps;
          const timeOfFirstWord = timestamps[timestamps.length - 2];
          const timeOfLastWord = timestamps[timestamps.length - 1];
          this.setState({
            wordTimestampAtViewStart: timeOfFirstWord
          });
          this.props.eventHandlers.onScroll([timeOfFirstWord, timeOfLastWord]);
          return;
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
            documentNode =
              captionNodeContainer.children[speakerIdx + loopCounter + 1];
            if (typeof documentNode === "undefined") {
              // We're at the last speaker anyway
              const timestamps = this.props.videoFact.timestamps;
              const timeOfFirstWord = timestamps[timestamps.length - 2];
              const timeOfLastWord = timestamps[timestamps.length - 1];
              this.setState({
                wordTimestampAtViewStart: timeOfFirstWord
              });
              this.props.eventHandlers.onScroll([
                timeOfFirstWord,
                timeOfLastWord
              ]);
              return;
            } else {
              const remainingHeight = 200 - heightOfLinesInView;

              // Get the height of the next paragraph
              const nextParagraphElement = this.getParagraphEl(documentNode);
              const heightOfNextParagraph = nextParagraphElement.clientHeight;

              // Calculate the number of lines in it based on the lineHeight
              totalLinesInNextParagraph = Math.ceil(
                heightOfNextParagraph / lineHeight
              );

              numberOfNextLinesInView = Math.floor(
                remainingHeight / lineHeight
              );

              if (numberOfNextLinesInView <= totalLinesInNextParagraph) {
                const idxOfFirstWordOfNextSpeaker =
                  speakerWordMap[speakerIdx + loopCounter];
                const idxOfLastWordOfNextSpeaker =
                  speakerWordMap[speakerIdx + loopCounter + 1];
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

        const timeOfFirstWord = this.props.videoFact.timestamps[
          indexOfFirstWord
        ];
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
    // Only allow this function to execute no more than 60x per second
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
    if (this.captionTextNodeList) {
      let captionNodeContainer = this.captionTextNodeList.getContainer();
      if (captionNodeContainer) {
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

        if (typeof captionNodeContainer.children[speakerIdx] == "undefined") {
          // If we're at the end, it can be length + 1. Just return the last valid speakername
          speakerIdx--;
        }

        const captionTextContainer =
          captionNodeContainer.children[speakerIdx].children[1];
        let hiddenTextElement;
        // This lookup should match the DOM structure of CaptionTextNode
        if (captionTextContainer && captionTextContainer.children[1]) {
          hiddenTextElement = captionTextContainer.children[1];
        } else {
          const msg =
            "CaptionTextNodeList: Couldn't find caption node at index " +
            speakerIdx;
          alertErr(msg);
          throw msg;
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

          const speakerNameHeight =
            captionNodeContainer.children[speakerIdx].children[0].clientHeight;
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
            (captionNodeContainer.children[speakerIdx] as HTMLElement)
              .offsetTop +
            25 * numberOfLines +
            totalSpeakerHeight;

          // Set the parent container's scrollTop value to the offsetTop
          captionNodeContainer.scrollTop = childTop;
        } else {
          const msg =
            "CaptionTextNodeList: Couldn't find end of word range for last speaker.";
          alertErr(msg);
          throw msg;
        }
      }
    }
  };
  componentDidMount() {
    this.setScrollView();
  }
  componentWillReceiveProps(nextProps: CaptionTextNodeListContainerProps) {
    // If our next prop is close to our current state, don't scroll.
    const { stateAuthority } = this.props;
    if (stateAuthority !== "SCROLL" && stateAuthority != null) {
      // Prevent this loop of heavy code from executing until necessary
      this.preventScroll = true;
      this.setScrollView(nextProps.view.start);
    }
  }
  render() {
    let wordCount: number;
    let nextWordCount: number;
    const eventHandlers: CaptionTextNodeListEventHandlers = {
      onMouseUp: this.props.eventHandlers.onMouseUp,
      onScroll: this.handleScroll
    };
    return (
      <div className="document__text">
        <h3 className="document__node-text document__node-text--speaker-top">
          {this.state.currentSpeaker}
        </h3>
        <CaptionTextNodeList
          documentNodes={this.props.documentNodes}
          eventHandlers={eventHandlers}
          ref={(captionTextNodeList: CaptionTextNodeList) =>
            (this.captionTextNodeList = captionTextNodeList)
          }
          videoFact={this.props.videoFact}
        />
      </div>
    );
  }
}

export default CaptionTextNodeListContainer;
