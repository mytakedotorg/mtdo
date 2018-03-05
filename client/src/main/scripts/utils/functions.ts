import * as React from "react";
import { ReactElement } from "react";
import { Foundation } from "../java2ts/Foundation";
var base64toArrayBuffer = require("base64-arraybuffer");
var bs = require("binary-search");

function decodeVideoFact(
  encoded: Foundation.VideoFactContentEncoded
): Foundation.VideoFactContentFast {
  const data: ArrayBuffer = base64toArrayBuffer.decode(encoded.data);
  // TODO: data is little-endian.  If the user's browser is big-endian,
  // the decoding will be invalid.  Someday we should detect if the
  // browser is big-endian, and do an endian-swap if it is.  No point
  // doing this until/if we actually have a big-endian device to test
  // with.

  var offset = 0;
  const charOffsets = new Int32Array(data, offset, encoded.numWords);
  offset += encoded.numWords * Int32Array.BYTES_PER_ELEMENT;
  const timestamps = new Float32Array(data, offset, encoded.numWords);
  offset += encoded.numWords * Float32Array.BYTES_PER_ELEMENT;
  const speakerPerson = new Int32Array(
    data,
    offset,
    encoded.numSpeakerSections
  );
  offset += encoded.numSpeakerSections * Int32Array.BYTES_PER_ELEMENT;
  const speakerWord = new Int32Array(data, offset, encoded.numSpeakerSections);
  offset += encoded.numSpeakerSections * Int32Array.BYTES_PER_ELEMENT;
  if (offset != data.byteLength) {
    alertErr("functions: sizes don't match");
    throw Error("Sizes don't match");
  }
  return {
    fact: encoded.fact,
    youtubeId: encoded.youtubeId,
    speakers: encoded.speakers,
    plainText: encoded.plainText,
    charOffsets: charOffsets,
    timestamps: timestamps,
    speakerPerson: speakerPerson,
    speakerWord: speakerWord
  };
}

export interface FoundationNode {
  component: string;
  offset: number;
  innerHTML: Array<string | React.ReactNode>;
}

export type CaptionNodeArr = Array<CaptionNode | Array<CaptionNode>>;

export type CaptionNode =
  | string
  | React.DetailedReactHTMLElement<
      {
        className: string;
        children?: React.ReactNode;
      },
      HTMLElement
    >;

function getNodesInRange(
  nodes: FoundationNode[],
  range: [number, number]
): FoundationNode[] {
  const startRange = range[0];
  const endRange = range[1];
  let documentNodes: FoundationNode[] = [];
  for (let idx = 0; idx < nodes.length; idx++) {
    if (nodes[idx + 1]) {
      if (nodes[idx + 1].offset <= startRange) {
        continue;
      }
    }
    if (nodes[idx].offset >= endRange) {
      break;
    }
    documentNodes = [...documentNodes, ...nodes.slice(idx, idx + 1)];
  }

  return documentNodes;
}

function getHighlightedNodes(
  nodes: FoundationNode[],
  range: [number, number],
  viewRange: [number, number]
): FoundationNode[] {
  if (range[0] === viewRange[0] && range[1] === viewRange[1]) {
    return getNodesInRange(nodes, range);
  }
  const startRange = range[0];
  const endRange = range[1];
  const documentNodes = getNodesInRange(nodes, viewRange);
  let highlightedNodes: FoundationNode[] = [];
  // documentNodes is a new array with only the nodes containing text to be highlighted
  if (documentNodes.length === 1) {
    const offset = documentNodes[0].offset;
    const startIndex = startRange - offset;
    const endIndex = endRange - offset;
    const newSpan: React.ReactNode = React.createElement(
      "span",
      {
        className: "editor__document-highlight",
        key: "somekey"
      },
      documentNodes[0].innerHTML.toString().substring(startIndex, endIndex)
    );
    let newNode: FoundationNode = (Object as any).assign({}, documentNodes[0]);
    const length = documentNodes[0].innerHTML.toString().length;
    newNode.innerHTML = [
      newNode.innerHTML.toString().substring(0, startIndex),
      newSpan,
      newNode.innerHTML.toString().substring(endIndex, length)
    ];
    highlightedNodes = [newNode];
  } else if (documentNodes.length > 1) {
    // More than one DOM node highlighted
    const offset = documentNodes[0].offset;
    const length = documentNodes[0].innerHTML.toString().length;
    const startIndex = startRange - offset;
    const endIndex = length;

    const newSpan: React.ReactNode = React.createElement(
      "span",
      {
        className: "editor__document-highlight",
        key: "somekey"
      },
      documentNodes[0].innerHTML.toString().substring(startIndex, endIndex)
    );

    let newNode: FoundationNode = (Object as any).assign({}, documentNodes[0]);
    newNode.innerHTML = [
      newNode.innerHTML.toString().substring(0, startIndex),
      newSpan
    ];

    highlightedNodes = [newNode];

    for (let index: number = 1; index < documentNodes.length; index++) {
      const offset = documentNodes[index].offset;
      const length = documentNodes[index].innerHTML.toString().length;
      const startIndex = 0;

      let endIndex;
      if (documentNodes[index + 1]) {
        // The selection continues beyond this one
        endIndex = length;
      } else {
        // This is the final node in the selection
        endIndex = endRange - offset;
      }

      const newSpan: React.ReactNode = React.createElement(
        "span",
        {
          className: "editor__document-highlight",
          key: "somekey"
        },
        documentNodes[index].innerHTML
          .toString()
          .substring(startIndex, endIndex)
      );

      let newNode: FoundationNode = (Object as any).assign(
        {},
        documentNodes[index]
      );
      newNode.innerHTML = [
        newSpan,
        newNode.innerHTML.toString().substring(endIndex, length)
      ];

      highlightedNodes = [...highlightedNodes, newNode];
    }
  }
  return highlightedNodes;
}

function findAncestor(node: Node, className: string): Node | null {
  while (node.parentNode) {
    node = node.parentNode;
    if ((node as HTMLElement).classList.contains(className)) {
      return node;
    }
  }
  return null;
}

/**
 * Returns offsetTop of the HTML element at the specified range index.
 */
function getStartRangeOffsetTop(
  childNodes: NodeList,
  range: [number, number]
): number {
  const startRange = range[0];
  const endRange = range[1];

  const rowIndexClassName = "document__row";
  const rowInnerIndexClassName = "document__row-inner";
  const textIndexClassName = "document__text";

  let rowIndex;
  const firstNodeList = childNodes;
  for (let i = 0; i < firstNodeList.length; i++) {
    for (let j = 0; j < firstNodeList[i].attributes.length; j++) {
      if (
        (firstNodeList[i] as HTMLElement).classList.contains(rowIndexClassName)
      ) {
        rowIndex = i;
        break;
      }
    }
    if (rowIndex !== undefined) {
      break;
    }
  }

  let rowInnerIndex;
  let secondNodeList;
  if (rowIndex !== undefined) {
    secondNodeList = firstNodeList[rowIndex].childNodes;
    for (let i = 0; i < secondNodeList.length; i++) {
      for (let j = 0; j < secondNodeList[i].attributes.length; j++) {
        if (
          (secondNodeList[i] as HTMLElement).classList.contains(
            rowInnerIndexClassName
          )
        ) {
          rowInnerIndex = i;
          break;
        }
      }
      if (rowInnerIndex !== undefined) {
        break;
      }
    }
  }

  let textIndex;
  let thirdNodeList;
  if (secondNodeList && rowInnerIndex !== undefined) {
    thirdNodeList = secondNodeList[rowInnerIndex].childNodes;
    for (let i = 0; i < thirdNodeList.length; i++) {
      for (let j = 0; j < thirdNodeList[i].attributes.length; j++) {
        if (
          (thirdNodeList[i] as HTMLElement).classList.contains(
            textIndexClassName
          )
        ) {
          textIndex = i;
          break;
        }
      }
      if (textIndex !== undefined) {
        break;
      }
    }
  }

  let resultNodes;
  if (thirdNodeList && textIndex !== undefined) {
    const textNodes = thirdNodeList[textIndex].childNodes;
    for (let idx = 0; idx < textNodes.length; idx++) {
      if ((textNodes[idx] as HTMLElement).dataset) {
        // Get the value of the data-char-offset attribute
        const dataOffset = (textNodes[idx] as HTMLElement).dataset.charOffset;
        if (textNodes[idx + 1]) {
          if (dataOffset && parseInt(dataOffset) <= startRange) {
            resultNodes = textNodes[idx];
            continue;
          } else {
            if (resultNodes) {
              return (resultNodes as HTMLElement).offsetTop;
            }
            resultNodes = textNodes[idx];
            return (resultNodes as HTMLElement).offsetTop;
          }
        }

        if (dataOffset && parseInt(dataOffset) > startRange) {
          break;
        }
        resultNodes = textNodes[idx];
      }
    }
  }

  if (resultNodes) {
    const offsetTop = (resultNodes as HTMLElement).offsetTop;
    return offsetTop;
  } else {
    return 0;
  }
}

/**
 *  Create an array of React elements for each Node in a given object.
 */

function zeroPad(someNumber: number): string {
  if (someNumber == 0) {
    return "00";
  }

  let twoDigitStr: string;
  if (someNumber < 10) {
    twoDigitStr = "0" + someNumber.toString();
  } else {
    twoDigitStr = someNumber.toString();
  }
  return twoDigitStr;
}

function convertSecondsToTimestamp(totalSeconds: number): string {
  let truncated = totalSeconds | 0;

  const hours = Math.floor(truncated / 3600);
  const HH = Math.floor(truncated / 3600).toString();

  truncated %= 3600;

  const seconds = truncated % 60;
  const SS = zeroPad(seconds);

  const minutes = Math.floor(truncated / 60);

  let MM;
  if (hours > 0) {
    MM = zeroPad(minutes);
    return HH + ":" + MM + ":" + SS;
  } else if (minutes > 0) {
    MM = minutes.toString();
    return MM + ":" + SS;
  } else {
    return seconds.toString();
  }
}

function getCaptionNodeArray(
  videoFact: Foundation.VideoFactContentFast
): Array<string> {
  let output: Array<string> = [];
  let prevOffset = 0;

  for (let n = 1; n < videoFact.speakerWord.length; n++) {
    let wordIdx = videoFact.speakerWord[n];
    let charOffset = videoFact.charOffsets[wordIdx];
    let innerHTML = videoFact.plainText.substring(prevOffset, charOffset);
    output.push(innerHTML);
    prevOffset = charOffset;
  }

  return output;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-") //replace spaces with hyphens
    .replace(/[-]+/g, "-") //replace multiple hyphens with single hyphen
    .replace(/[^\w-]+/g, ""); //remove non-alphanumics and non-hyphens
}

function getWordCount(selection: Selection): number {
  // Cursor is in a block of caption text

  // Get the text Node
  const textNode = selection.anchorNode;

  // Get the character offset of the cursor position in the Node
  const anchorOffset = selection.anchorOffset;

  // Get the word offset of the cursor position in the Node
  let wordCount;
  if (textNode.textContent) {
    wordCount = textNode.textContent
      .toString()
      .substring(0, anchorOffset)
      .split(" ").length;
  } else {
    wordCount = 0;
  }

  let paragraphNode;
  if (textNode.parentNode) {
    paragraphNode = textNode.parentNode.parentNode;
  } else {
    alertErr("functions: Unknown HTML Structure");
    throw "Unknown HTML Structure";
  }

  if (paragraphNode) {
    let captionBlock = paragraphNode.parentNode;

    while (captionBlock && captionBlock.previousSibling) {
      captionBlock = captionBlock.previousSibling;
      const prevTextNode = captionBlock.childNodes[1].childNodes[0];
      if (prevTextNode.textContent) {
        wordCount += prevTextNode.textContent.toString().split(" ").length;
      }
    }
  }

  return wordCount;
}

function getCharRangeFromVideoRange(
  charOffsets: ArrayLike<number>,
  timeStamps: ArrayLike<number>,
  timeRange: [number, number]
): [number, number] {
  const startTime = timeRange[0];
  const endTime = timeRange[1];

  const comparator = (element: number, needle: number) => {
    return element - needle;
  };

  let firstWordIdx = bs(timeStamps, startTime, comparator);

  if (firstWordIdx < 0) {
    firstWordIdx = -firstWordIdx - 2;
    if (firstWordIdx < 0) {
      // If still negative, it means we're at the first word
      firstWordIdx = 0;
    }
  }

  let lastWordIdx = bs(timeStamps, endTime, comparator);

  if (lastWordIdx < 0) {
    lastWordIdx = -lastWordIdx - 2;
    if (lastWordIdx < 0) {
      // If still negative, it means we're at the first word
      lastWordIdx = 0;
    }
  }

  const startCharIndex = charOffsets[firstWordIdx];
  const endCharIndex = charOffsets[lastWordIdx + 1];

  return [startCharIndex, endCharIndex];
}

function isCaptionNode(htmlRange: Range): boolean {
  if (
    htmlRange.startContainer.parentNode &&
    htmlRange.startContainer.parentNode.parentNode &&
    (htmlRange.startContainer.parentNode
      .parentNode as HTMLElement).className.indexOf("document__node") >= 0
  ) {
    return true;
  } else {
    return false;
  }
}

function getContainer(
  nodes: NodeList,
  containerIndex: number,
  classNames: string[]
): Node {
  let rowIndex;
  let nodeList = nodes;
  for (let i = 0; i < classNames.length; i++) {
    for (let j = 0; j < nodeList.length; j++) {
      if ((nodeList[j] as HTMLElement).classList.contains(classNames[i])) {
        rowIndex = j;
        break;
      }
    }
    if (i < classNames.length - 1) {
      if (rowIndex !== undefined) {
        nodeList = nodeList[rowIndex].childNodes;
      } else {
        alertErr("functions: Couldn't find nodes in " + classNames[i]);
        throw "Couldn't find nodes in " + classNames[i];
      }
    }
  }

  if (rowIndex !== undefined) {
    return nodeList[rowIndex].childNodes[containerIndex];
  } else {
    alertErr(
      "functions: Couldn't find nodes in " + classNames[classNames.length]
    );
    throw "Couldn't find nodes in " + classNames[classNames.length];
  }
}

export interface SimpleRanges {
  charRange: [number, number];
  wordRange: [number, number];
  viewRange: [number, number];
}

function getSimpleRangesFromHTMLRange(
  htmlRange: Range,
  childNodes: NodeList
): SimpleRanges {
  let classNames: string[];

  let startChildNode: Node | null;
  let endChildNode: Node | null;
  const isCaption = isCaptionNode(htmlRange);
  if (isCaption) {
    startChildNode = findAncestor(htmlRange.startContainer, "document__node");
    endChildNode = findAncestor(htmlRange.endContainer, "document__node");
    classNames = [
      "document__row",
      "document__row-inner",
      "document__text",
      "document__text--caption"
    ];
  } else {
    startChildNode = htmlRange.startContainer.parentNode;
    endChildNode = htmlRange.endContainer.parentNode;
    classNames = ["document__row", "document__row-inner", "document__text"];
  }

  const startParentContainer = findAncestor(
    htmlRange.startContainer,
    "document__text"
  );

  let indexOfStartContainer: number;
  if (startParentContainer) {
    indexOfStartContainer = Array.prototype.indexOf.call(
      startParentContainer.childNodes, //Arrange siblings into an array
      startChildNode
    ); //Find indexOf current Node
  } else {
    alertErr("functions: Couldn't find start container");
    throw "Couldn't find start container";
  }

  const endParentContainer = findAncestor(
    htmlRange.endContainer,
    "document__text"
  );

  let indexOfEndContainer: number;
  if (endParentContainer) {
    indexOfEndContainer = Array.prototype.indexOf.call(
      endParentContainer.childNodes, //Arrange siblings into an array
      endChildNode
    ); //Find indexOf current Node
  } else {
    alertErr("functions: Couldn't find end container");
    throw "Couldn't find end container";
  }

  let startContainer = getContainer(
    childNodes,
    indexOfStartContainer,
    classNames
  );
  let endContainer = getContainer(childNodes, indexOfEndContainer, classNames);

  let wordCountBeforeSelection = 0;
  let charCountBeforeSelection = 0;

  if (isCaption) {
    startContainer = startContainer.childNodes[1].childNodes[0];
    endContainer = endContainer.childNodes[1].childNodes[0];

    // Get word and char counts
    if (startContainer.parentNode && startContainer.parentNode.parentNode) {
      let prevSib = startContainer.parentNode.parentNode.previousSibling;
      while (prevSib) {
        const prevSibChild = prevSib.childNodes[1].childNodes[0];
        if (prevSibChild && prevSibChild.textContent) {
          const text = prevSibChild.textContent;
          wordCountBeforeSelection += text.split(" ").length - 1; //There is an extra space at the end we don't count
          charCountBeforeSelection += text.length;
        } else {
          alertErr("functions: Unexpcected HTML structure");
          throw "Unexpected HTML structure";
        }
        prevSib = prevSib.previousSibling;
      }
    } else {
      alertErr("functions: Unexpcected HTML structure");
      throw "Unexpected HTML structure";
    }
  } else {
    // Get word count
    let prevSib = startContainer.previousSibling;
    while (prevSib && prevSib.textContent) {
      const text = prevSib.textContent;
      wordCountBeforeSelection += text.split(" ").length;
      charCountBeforeSelection += text.length;
      prevSib = prevSib.previousSibling;
    }
  }

  let wordStart: number;
  let wordEnd: number;
  let charStart: number;
  let charEnd: number;
  let viewStart: number;
  let viewEnd: number;

  if (startContainer.textContent) {
    const preCaretRange = htmlRange.cloneRange();
    preCaretRange.selectNodeContents(startContainer);
    preCaretRange.setEnd(htmlRange.startContainer, htmlRange.startOffset);
    const textBeforeStart = preCaretRange.toString();
    wordStart =
      wordCountBeforeSelection + textBeforeStart.split(" ").length - 1;
    charStart = charCountBeforeSelection + textBeforeStart.length;
    viewStart = charCountBeforeSelection;
  } else {
    alertErr("functions: Unexpcected HTML structure");
    throw "Unexpected HTML structure";
  }

  if (startContainer === endContainer && endContainer.textContent) {
    const preCaretRange = htmlRange.cloneRange();
    preCaretRange.selectNodeContents(endContainer);
    preCaretRange.setEnd(htmlRange.endContainer, htmlRange.endOffset);
    const textBeforeEnd = preCaretRange.toString();
    wordEnd = wordCountBeforeSelection + textBeforeEnd.split(" ").length - 1;
    charEnd = charCountBeforeSelection + textBeforeEnd.length;
    viewEnd = charCountBeforeSelection + endContainer.textContent.length;

    return {
      charRange: [charStart, charEnd],
      wordRange: [wordStart, wordEnd],
      viewRange: [viewStart, viewEnd]
    };
  } else {
    // Count words/chars where selection begins
    const textOfStartContainer = startContainer.textContent;
    wordCountBeforeSelection += textOfStartContainer.split(" ").length - 1;
    charCountBeforeSelection += textOfStartContainer.length;

    if (isCaption) {
      // Count words/chars in the middle of the selection
      for (
        let index: number = indexOfStartContainer + 1;
        index < indexOfEndContainer;
        index++
      ) {
        if (
          startContainer.parentNode &&
          startContainer.parentNode.parentNode &&
          startContainer.parentNode.parentNode.parentNode
        ) {
          const textOfMiddleContainer =
            startContainer.parentNode.parentNode.parentNode.childNodes[index]
              .childNodes[1].childNodes[0].textContent;
          if (textOfMiddleContainer) {
            wordCountBeforeSelection += textOfMiddleContainer.split(" ").length;
            charCountBeforeSelection += textOfMiddleContainer.length;
          }
        } else {
          alertErr("functions: Unexpcected HTML structure");
          throw "Unexpected HTML structure";
        }
      }
    } else {
      // Count words/chars in the middle of the selection
      for (
        let index: number = indexOfStartContainer + 1;
        index < indexOfEndContainer;
        index++
      ) {
        if (startContainer.parentNode) {
          const textOfMiddleContainer =
            startContainer.parentNode.childNodes[index].textContent;
          if (textOfMiddleContainer) {
            wordCountBeforeSelection += textOfMiddleContainer.split(" ").length;
            charCountBeforeSelection += textOfMiddleContainer.length;
          }
        } else {
          alertErr("functions: Unexpcected HTML structure");
          throw "Unexpected HTML structure";
        }
      }
    }

    // Count words/chars at the end of the selection
    const textOfEndContainer = endContainer.textContent;
    if (textOfEndContainer) {
      const preCaretRange = htmlRange.cloneRange();
      preCaretRange.selectNodeContents(endContainer);
      preCaretRange.setEnd(htmlRange.endContainer, htmlRange.endOffset);
      const textBeforeEnd = preCaretRange.toString();
      wordEnd = wordCountBeforeSelection + textBeforeEnd.split(" ").length - 1;
      charEnd = charCountBeforeSelection + textBeforeEnd.length;
      viewEnd = charCountBeforeSelection + textOfEndContainer.length;

      return {
        charRange: [charStart, charEnd],
        wordRange: [wordStart, wordEnd],
        viewRange: [viewStart, viewEnd]
      };
    } else {
      alertErr("functions: Unexpcected HTML structure");
      throw "Unexpected HTML structure";
    }
  }
}

function highlightText(
  nodes: FoundationNode[],
  range: [number, number],
  handleSetClick: () => void
): FoundationNode[] {
  const foundationClassName = "document__text--selected";
  let charCount = 0;
  const newNodes: FoundationNode[] = [];
  let isFirstNodeWithHighlights = true;
  let isFinished = false;
  for (const node_1 of nodes) {
    const node: FoundationNode = (Object as any).assign({}, node_1);
    if (charCount + node.innerHTML.toString().length <= range[0]) {
      charCount += node.innerHTML.toString().length;
      newNodes.push(node);
      continue;
    }
    if (isFirstNodeWithHighlights) {
      if (charCount + node.innerHTML.toString().length <= range[1]) {
        isFirstNodeWithHighlights = false;
        const startOffset = range[0] - charCount;
        charCount += node.innerHTML.toString().length;
        const textBefore = node.innerHTML.toString().substring(0, startOffset);
        const textContent = node.innerHTML.toString().substring(startOffset);
        // First span
        const newSpan: React.ReactNode = React.createElement(
          "span",
          {
            className: foundationClassName,
            key: "someKey",
            onClick: () => handleSetClick()
          },
          textContent
        );

        const newNode = node;
        newNode.innerHTML = [textBefore, newSpan];
        newNodes.push(node);
        continue;
      } else {
        isFirstNodeWithHighlights = false;
        // A single node contains the full range
        const startOffset = range[0] - charCount;
        const endOffset = range[1] - charCount;
        charCount += node.innerHTML.toString().length;
        const textBefore = node.innerHTML.toString().substring(0, startOffset);
        const textContent = node.innerHTML
          .toString()
          .substring(startOffset, endOffset);
        const textAfter = node.innerHTML.toString().substring(endOffset);

        const newSpan: React.ReactNode = React.createElement(
          "span",
          {
            className: foundationClassName,
            key: "someKey",
            onClick: () => handleSetClick()
          },
          textContent
        );

        const newNode = node;
        newNode.innerHTML = [textBefore, newSpan, textAfter];
        newNodes.push(node);
        isFinished = true;
        continue;
      }
    }
    if (
      charCount + node.innerHTML.toString().length <= range[1] &&
      !isFinished
    ) {
      charCount += node.innerHTML.toString().length;

      const newSpan: React.ReactNode = React.createElement(
        "span",
        {
          className: foundationClassName,
          key: "someKey",
          onClick: () => handleSetClick()
        },
        node.innerHTML
      );

      const newNode = node;
      newNode.innerHTML = [newSpan];
      newNodes.push(node);
      continue;
    } else if (!isFinished) {
      const endOffset = range[1] - charCount;
      const textContent = node.innerHTML.toString().substring(0, endOffset);
      const textAfter = node.innerHTML.toString().substring(endOffset);

      const newSpan: React.ReactNode = React.createElement(
        "span",
        {
          className: foundationClassName,
          key: "someKey",
          onClick: () => handleSetClick()
        },
        textContent
      );

      const newNode = node;
      newNode.innerHTML = [newSpan, textAfter];
      newNodes.push(node);
      isFinished = true;
    } else {
      newNodes.push(node);
    }
  }
  return newNodes;
}

function highlightCaption(
  nodes: string[],
  range: [number, number]
): CaptionNodeArr {
  const foundationClassName = "document__text--selected";
  let charCount = 0;
  const newNodes: CaptionNodeArr = [];
  let isFirstNodeWithHighlights = true;
  let isFinished = false;
  for (const node of nodes) {
    const nodeLength = node.length;
    if (charCount + nodeLength <= range[0]) {
      // Before the range start, output is same as input
      charCount += nodeLength;
      newNodes.push(node);
      continue;
    }
    if (isFirstNodeWithHighlights) {
      isFirstNodeWithHighlights = false;
      const startOffset = range[0] - charCount;
      const textBefore = node.substring(0, startOffset);
      if (charCount + nodeLength <= range[1]) {
        charCount += nodeLength;
        const textContent = node.substring(startOffset);
        // First span
        const newSpan = React.createElement(
          "span",
          { className: foundationClassName, key: "someKey" },
          textContent
        );

        const newNode = [textBefore, newSpan];
        newNodes.push(newNode);
        continue;
      } else {
        // A single node contains the full range
        const endOffset = range[1] - charCount;
        charCount += nodeLength;
        const textContent = node.substring(startOffset, endOffset);
        const textAfter = node.substring(endOffset);

        const newSpan = React.createElement(
          "span",
          { className: foundationClassName, key: "someKey" },
          textContent
        );

        const newNode = [textBefore, newSpan, textAfter];
        newNodes.push(newNode);
        isFinished = true;
        continue;
      }
    }
    if (charCount + nodeLength <= range[1] && !isFinished) {
      charCount += nodeLength;

      const newSpan = React.createElement(
        "span",
        { className: foundationClassName, key: "someKey" },
        node
      );

      newNodes.push([newSpan]);
      continue;
    } else if (!isFinished) {
      const endOffset = range[1] - charCount;
      const textContent = node.substring(0, endOffset);
      const textAfter = node.substring(endOffset);

      const newSpan = React.createElement(
        "span",
        { className: foundationClassName, key: "someKey" },
        textContent
      );

      const newNode = [newSpan, textAfter];
      newNodes.push(newNode);
      isFinished = true;
    } else {
      newNodes.push(node);
    }
  }
  return newNodes;
}

function alertErr(errMsg: string) {
  const msg =
    "Something went wrong. To help us figure it out, please copy and paste the information from below into an email to team@mytake.org. Thank you." +
    "\n\n" +
    "Error message: " +
    errMsg +
    "\nURL: " +
    window.location.href;
  alert(msg);
}

const drawSpecs = Object.freeze({
  textMargin: 16,
  width: 500,
  linewidth: 468,
  lineheight: 1.5 //multiplier
});

interface Dimensions {
  x: number;
  y: number;
  totalHeight: number;
}

function drawText(
  ctx: CanvasRenderingContext2D,
  words: string,
  fontsize: number,
  initialX?: number,
  initialY?: number
): Dimensions {
  let wordsArr = words.split(" ");
  // Initialize variables
  let currentLineWidth = 0;
  let isFirstLine = true;
  let line = "";
  let x = initialX ? initialX : drawSpecs.textMargin;
  let y = initialY ? initialY : fontsize;
  let totalHeight = fontsize;

  for (const word of wordsArr) {
    if (isFirstLine && initialX) {
      // Need to include width of previous line in this case
      currentLineWidth = ctx.measureText(line + word).width + initialX;
    } else {
      currentLineWidth = ctx.measureText(line + word).width;
    }

    if (currentLineWidth > drawSpecs.linewidth) {
      // Start a new line
      if (isFirstLine) {
        if (!initialX) {
          y += fontsize / 2; //top margin of new paragraph
        }
        isFirstLine = false;
      } else {
        y += fontsize * drawSpecs.lineheight;
      }
      ctx.fillText(line, x, y);
      totalHeight += fontsize * drawSpecs.lineheight;
      x = drawSpecs.textMargin;
      line = word + " ";
    } else {
      line += word + " ";
    }
  }

  // Draw the last line
  if (line.length > 0) {
    if (isFirstLine) {
      if (!initialX) {
        y += fontsize / 2; //top margin of new paragraph
      }
      isFirstLine = false;
    } else {
      y += fontsize * drawSpecs.lineheight;
    }
    totalHeight += fontsize * drawSpecs.lineheight;
    ctx.fillText(line, x, y);
    x = drawSpecs.textMargin;
  }

  totalHeight += fontsize / 2; // add bottom margin

  let finalLineWidth;
  if (initialX) {
    finalLineWidth =
      ctx.measureText(line).width + initialX - drawSpecs.textMargin;
  } else {
    finalLineWidth = ctx.measureText(line).width;
  }

  return {
    x: finalLineWidth,
    y: y,
    totalHeight: totalHeight
  };
}

function drawDocumentText(
  ctx: CanvasRenderingContext2D,
  nodes: FoundationNode[],
  title: string
): number {
  // Draw fact title
  const titleSize = 20;
  let textSize = titleSize;
  ctx.font = "Bold " + textSize.toString() + "px Source Sans Pro";
  let x = drawSpecs.textMargin;
  let y = textSize;
  ctx.fillText(title, x, y);

  for (const node of nodes) {
    if (node.component === "h2") {
      // Set the font style
      textSize = 22.5;
      ctx.font = "Bold " + textSize.toString() + "px Merriweather";

      // Add a margin above the new line of text
      y += textSize * drawSpecs.lineheight;

      // Initialize an empty line of texxt
      let line = "";
      for (const text of node.innerHTML) {
        // Loop through the innerHTML array to search for React Elements
        if (text) {
          let textStr = text.toString();
          if (textStr === "[object Object]") {
            // Can't find a better conditional test
            // Found a React Element
            line += (text as ReactElement<HTMLSpanElement>).props.children;
          } else {
            line += textStr;
          }
        }
      }

      // Write the line of text at the coordinates
      ctx.fillText(line, drawSpecs.textMargin, y);
    } else if (node.component === "p") {
      // Set font size
      textSize = 15;

      // Initialize the coorindates
      x = drawSpecs.textMargin; // Left margin of text
      y += textSize * drawSpecs.lineheight * drawSpecs.lineheight; // Top margin

      // Loop through the innerHTML array to search for React Elements
      for (const text of node.innerHTML) {
        if (text) {
          let textStr = text.toString();
          let words = "";
          if (textStr === "[object Object]") {
            // Can't find a better conditional test
            // Found a React Element
            words += (text as ReactElement<HTMLSpanElement>).props.children;
            // This text is highlighted, so make it bold
            ctx.font = "Bold " + textSize.toString() + "px Merriweather";
          } else {
            words += textStr.trim();
            ctx.font = textSize.toString() + "px Merriweather";
          }

          const dimensions = drawText(ctx, words, textSize, x, y);
          // Set the dimensions of the next line to be drawn where the previous line left off
          y = dimensions.y;
          x = drawSpecs.textMargin + dimensions.x;
        }
      }
      y += textSize / 2; //bottom margin
    } else {
      const errStr = "Unknown component";
      alertErr(errStr);
      throw errStr;
    }
  }
  return y;
}

export interface ImageProps {
  dataUri: string;
  width: string;
  height: string;
}

function drawDocument(nodes: FoundationNode[], title: string): ImageProps {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = drawSpecs.width * window.devicePixelRatio;
  canvas.style.width = drawSpecs.width + "px";

  if (ctx) {
    // Draw the document once to calculate height
    const height = drawDocumentText(ctx, [...nodes], title);

    canvas.height = height * window.devicePixelRatio;
    canvas.style.height = height + "px";

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw grey background
    ctx.fillStyle = "#f2f4f7";
    ctx.fillRect(0, 0, drawSpecs.width, height);

    // Set text color
    ctx.fillStyle = "#051a38";

    // Draw document again to draw the text
    drawDocumentText(ctx, [...nodes], title);

    return {
      dataUri: canvas.toDataURL("image/png"),
      width: drawSpecs.width.toString(),
      height: height.toString()
    };
  } else {
    const errStr = "Error getting canvas context";
    alertErr(errStr);
    throw errStr;
  }
}

function drawCaption(text: string): ImageProps {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = drawSpecs.width * window.devicePixelRatio;
  canvas.style.width = drawSpecs.width + "px";

  if (ctx) {
    // Set font styles
    const textSize = 15;
    ctx.font = "Bold " + textSize.toString() + "px Merriweather";

    // Draw text once to calculate height
    const height = drawText(ctx, text, textSize).totalHeight;

    canvas.height = height * window.devicePixelRatio;
    canvas.style.height = height + "px";

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Draw grey background
    ctx.fillStyle = "#f2f4f7";
    ctx.fillRect(0, 0, drawSpecs.width, height);
    ctx.fillStyle = "#051a38";

    // Not sure why, but font has been reset at this point, so must set it again
    ctx.font = "Bold " + textSize.toString() + "px Merriweather";
    drawText(ctx, text, textSize);

    return {
      dataUri: canvas.toDataURL("image/png"),
      width: drawSpecs.width.toString(),
      height: height.toString()
    };
  } else {
    const errStr = "Error getting canvas context";
    alertErr(errStr);
    throw errStr;
  }
}
function getUserCookieString(): string {
  function getCookieValue(a: string): string {
    // https://stackoverflow.com/questions/5639346/what-is-the-shortest-function-for-reading-a-cookie-by-name-in-javascript?noredirect=1&lq=1
    const b = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)");
    if (b) {
      const c = b.pop();
      return c ? c : "";
    }
    return "";
  }

  return getCookieValue("loginui");
}
export {
  alertErr,
  convertSecondsToTimestamp,
  decodeVideoFact,
  drawCaption,
  drawDocument,
  drawDocumentText,
  drawSpecs,
  drawText,
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  getSimpleRangesFromHTMLRange,
  getStartRangeOffsetTop,
  getHighlightedNodes,
  getNodesInRange,
  getUserCookieString,
  getWordCount,
  highlightCaption,
  highlightText,
  slugify
};
