import * as React from "react";
import { Foundation } from "../java2ts/Foundation";
var base64toArrayBuffer = require("base64-arraybuffer");

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
  const charOffsets = new Int32Array(
    data,
    offset,
    (offset += encoded.numWords * Int32Array.BYTES_PER_ELEMENT)
  );
  const timestamps = new Float32Array(
    data,
    offset,
    (offset += encoded.numWords * Float32Array.BYTES_PER_ELEMENT)
  );
  const speakerPerson = new Int32Array(
    data,
    offset,
    (offset += encoded.numSpeakerSections * Int32Array.BYTES_PER_ELEMENT)
  );
  const speakerWord = new Int32Array(
    data,
    offset,
    (offset += encoded.numSpeakerSections * Int32Array.BYTES_PER_ELEMENT)
  );
  if (offset != data.byteLength) {
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

function clearDefaultDOMSelection(): void {
  if (window.getSelection) {
    if (window.getSelection().empty) {
      // Chrome
      window.getSelection().empty();
    } else if (window.getSelection().removeAllRanges) {
      // Firefox
      window.getSelection().removeAllRanges();
    }
  } else {
    // pre IE 9, unsupported
  }
}

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
  let documentNodes = getNodesInRange(nodes, viewRange);
  let highlightedNodes: FoundationNode[] = [];
  // documentNodes is a new array with only the nodes containing text to be highlighted
  if (documentNodes.length === 1) {
    const offset = documentNodes[0].offset;
    const startIndex = startRange - offset;
    const endIndex = endRange - offset;
    let newSpan: React.ReactNode = React.createElement(
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
    let offset = documentNodes[0].offset;
    let length = documentNodes[0].innerHTML.toString().length;
    let startIndex = startRange - offset;
    let endIndex = length;

    let newSpan: React.ReactNode = React.createElement(
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
      offset = documentNodes[index].offset;
      length = documentNodes[index].innerHTML.toString().length;
      startIndex = 0;

      if (documentNodes[index + 1]) {
        // The selection continues beyond this one
        endIndex = length;
      } else {
        // This is the final node in the selection
        endIndex = endRange - offset;
      }

      let newSpan: React.ReactNode = React.createElement(
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
    if (
      (node as HTMLElement).className &&
      (node as HTMLElement).className.indexOf(className) >= 0
    ) {
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

  let rowIndexClassName = "document__row";
  let rowInnerIndexClassName = "document__row-inner";
  let textIndexClassName = "document__text";

  let rowIndex;
  let firstNodeList = childNodes;
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
    let textNodes = thirdNodeList[textIndex].childNodes;
    for (let idx = 0; idx < textNodes.length; idx++) {
      if ((textNodes[idx] as HTMLElement).dataset) {
        // Get the value of the data-char-offset attribute
        let dataOffset = (textNodes[idx] as HTMLElement).dataset.charOffset;
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

        if (dataOffset && parseInt(dataOffset) > endRange) {
          break;
        }
        resultNodes = textNodes[idx];
      }
    }
  }

  if (resultNodes) {
    let offsetTop = (resultNodes as HTMLElement).offsetTop;
    return offsetTop;
  } else {
    return 0;
  }
}

/**
 *  Create an array of React elements for each Node in a given object.
 */

interface FoundationComponent {
  component: "p" | "h2" | "h3";
  innerHTML: string;
}

function getNodeArray(excerptId: string): FoundationNode[] {
  // Fetch the excerpt from the DB by its ID
  throw "TODO";
  // const excerpt = getDocumentFact(excerptId);
  // let source;
  // if (excerpt) {
  //   source = require("../foundation/" + excerpt.filename);
  // } else {
  //   throw "Error retrieving Foundation document";
  // }

  // if (source) {
  //   const output: Array<FoundationNode> = [];
  //   const components: FoundationComponent[] = JSON.parse(source);
  //   let offset = 0;
  //   for (const component of components) {
  //     output.push({
  //       component: component.component,
  //       props: {
  //         offset: offset
  //       },
  //       innerHTML: [component.innerHTML]
  //     });
  //     offset += component.innerHTML.length;
  //   }

  //   return output;
  // } else {
  //   throw "Error retrieving Foundation document";
  // }
}

function zeroPad(someNumber: number): string {
  let twoDigitStr: string;
  if (someNumber == 0) {
    return "00";
  }

  if (someNumber < 10) {
    twoDigitStr = "0" + someNumber.toString();
  } else {
    twoDigitStr = someNumber.toString();
  }
  return twoDigitStr;
}

function convertSecondsToTimestamp(totalSeconds: number): string {
  const DD = totalSeconds.toFixed(1).split(".")[1];

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
    return HH + ":" + MM + ":" + SS + "." + DD;
  } else if (minutes > 0) {
    MM = minutes.toString();
    return MM + ":" + SS + "." + DD;
  } else {
    return seconds.toString() + "." + DD;
  }
}

function getCaptionNodeArray(
  transcript: Foundation.CaptionWord[],
  speakerMap: Foundation.SpeakerMap[]
): Array<FoundationNode> {
  // Fetch the excerpt from the DB by its ID
  let output: Array<FoundationNode> = [];
  let offset = 0;
  for (const speaker of speakerMap) {
    let innerHTML = "";
    for (let i = speaker.range[0]; i <= speaker.range[1]; i++) {
      if (transcript[i]) {
        innerHTML += transcript[i].word;
      }
    }

    innerHTML = innerHTML.trim(); //Replace extra whitespace with a single space

    if (innerHTML.length > 0) {
      output.push({
        component: "p",
        offset: offset,
        innerHTML: [innerHTML]
      });

      // Character count offset
      offset += innerHTML.length;
    } else {
      throw "A speaker's start range can't be greater than the end range, offending range: " +
        speaker.range;
    }
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
  let textNode = selection.anchorNode;

  // Get the character offset of the cursor position in the Node
  let anchorOffset = selection.anchorOffset;

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
    throw "Unknown HTML Structure";
  }

  if (paragraphNode) {
    let captionBlock = paragraphNode.parentNode;

    while (captionBlock && captionBlock.previousSibling) {
      captionBlock = captionBlock.previousSibling;
      let prevTextNode = captionBlock.childNodes[1].childNodes[0];
      if (prevTextNode.textContent) {
        wordCount += prevTextNode.textContent.toString().split(" ").length;
      }
    }
  }

  return wordCount;
}

function getCharRangeFromVideoRange(
  transcript: Foundation.CaptionWord[],
  speakerMap: Foundation.SpeakerMap[],
  timeRange: [number, number]
): [number, number] {
  const startTime = timeRange[0];
  const endTime = timeRange[1];

  let charCount = 0;
  let startCharIndex: number = -1;
  let isStartSet = false;
  let endCharIndex: number = -1;

  for (const captionWord of transcript) {
    if (captionWord.timestamp < startTime) {
      charCount += captionWord.word.length;
      continue;
    }
    if (!isStartSet) {
      // This block only executes once
      startCharIndex = charCount;

      // Subtract 1 for every paragraph break. HTML removes extra whitespace, but our data model still contains a space.
      for (const speakerIdx in speakerMap) {
        if (speakerMap[speakerIdx].range[1] < captionWord.idx) {
          continue;
        }
        const paragraphCount = parseInt(speakerIdx);
        startCharIndex -= paragraphCount;

        // Don't let index go negative here
        if (startCharIndex < 0) {
          startCharIndex = 0;
        }
        break;
      }

      isStartSet = true;
    }
    if (captionWord.timestamp <= endTime) {
      charCount += captionWord.word.length;
      continue;
    }

    endCharIndex = charCount;
    // Subtract 1 for every paragraph break. HTML removes extra whitespace, but our data model still contains a space.
    for (const speakerIdx in speakerMap) {
      if (speakerMap[speakerIdx].range[1] < captionWord.idx) {
        continue;
      }
      const paragraphCount = parseInt(speakerIdx);
      endCharIndex -= paragraphCount;

      // Don't let index go negative here
      if (endCharIndex < 0) {
        endCharIndex = 0;
      }
      break;
    }
    break;
  }

  if (startCharIndex >= 0 && endCharIndex >= 0) {
    return [startCharIndex, endCharIndex];
  } else {
    throw "Index not found";
  }
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
        throw "Couldn't find nodes in " + classNames[i];
      }
    }
  }

  if (rowIndex !== undefined) {
    return nodeList[rowIndex].childNodes[containerIndex];
  } else {
    throw "Couldn't find nodes in " + classNames[classNames.length];
  }
}

interface SimpleRanges {
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
    if (
      htmlRange.startContainer.parentNode &&
      htmlRange.startContainer.parentNode.parentNode &&
      htmlRange.endContainer.parentNode &&
      htmlRange.endContainer.parentNode.parentNode
    ) {
      startChildNode =
        htmlRange.startContainer.parentNode.parentNode.parentNode;
      endChildNode = htmlRange.endContainer.parentNode.parentNode.parentNode;
    } else {
      throw "Unexpcected HTML structure";
    }
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
          wordCountBeforeSelection += text.split(" ").length;
          charCountBeforeSelection += text.length;
        } else {
          throw "Unexpected HTML structure";
        }
        prevSib = prevSib.previousSibling;
      }
    } else {
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
    const textBeforeStart = startContainer.textContent.substring(
      0,
      htmlRange.startOffset
    );
    wordStart =
      wordCountBeforeSelection + textBeforeStart.split(" ").length - 1;
    charStart = charCountBeforeSelection + textBeforeStart.length;
    viewStart = charCountBeforeSelection;
  } else {
    throw "Unexpected HTML structure";
  }

  if (startContainer === endContainer && endContainer.textContent) {
    const textBeforeEnd = endContainer.textContent.substr(
      0,
      htmlRange.endOffset
    );
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
    wordCountBeforeSelection += textOfStartContainer.split(" ").length;
    charCountBeforeSelection += textOfStartContainer.length;

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
        throw "Unexpected HTML structure";
      }
    }

    // Count words/chars at the end of the selection
    const textOfEndContainer = endContainer.textContent;
    if (textOfEndContainer) {
      const textBeforeEnd = textOfEndContainer.substr(0, htmlRange.endOffset);
      wordEnd = wordCountBeforeSelection + textBeforeEnd.split(" ").length - 1;
      charEnd = charCountBeforeSelection + textBeforeEnd.length;
      viewEnd = charCountBeforeSelection + textOfEndContainer.length;

      return {
        charRange: [charStart, charEnd],
        wordRange: [wordStart, wordEnd],
        viewRange: [viewStart, viewEnd]
      };
    } else {
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

export {
  clearDefaultDOMSelection,
  convertSecondsToTimestamp,
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  getSimpleRangesFromHTMLRange,
  getStartRangeOffsetTop,
  getHighlightedNodes,
  getNodesInRange,
  getNodeArray,
  getWordCount,
  highlightText,
  slugify
};

export default {};
