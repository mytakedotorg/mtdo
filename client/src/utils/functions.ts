import * as React from "react";
import { CaptionWord, DocumentFact, VideoFact } from "./databaseData";
import {
  getVideoCaptionWordMap,
  getVideoFact,
  getDocumentFact,
  getVideoFactCaptionFile,
  getVideoCaptionMetaData
} from "./databaseAPI";
var htmlparser = require("htmlparser2");

export interface FoundationNode {
  component: string;
  props: FoundationNodeProps;
  innerHTML: Array<string | React.ReactNode>;
}

export interface FoundationNodeProps {
  offset: number;
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
      if (nodes[idx + 1].props.offset <= startRange) {
        continue;
      }
    }
    if (nodes[idx].props.offset >= endRange) {
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
    const offset = documentNodes[0].props.offset;
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
    let offset = documentNodes[0].props.offset;
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
      offset = documentNodes[index].props.offset;
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

interface HighlightedText {
  newNodes: FoundationNode[];
  highlightedCharacterRange: [number, number];
  highlightedWordRange: [number, number];
  viewRange: [number, number];
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

function highlightText(
  range: Range,
  nodes: FoundationNode[],
  childNodes: NodeList,
  handleSetClick: () => void
): HighlightedText {
  let rowIndexClassName = "document__row";
  let rowInnerIndexClassName = "document__row-inner";
  let textIndexClassName = "document__text";
  let foundationClassName = "document__text--selected";

  let indexOfStartContainer;

  let startParentContainer = findAncestor(
    range.startContainer,
    textIndexClassName
  );
  let startChildNode;
  let isCaptionNode: boolean;
  if (
    range.startContainer.parentNode &&
    (range.startContainer.parentNode as HTMLElement).className.indexOf(
      "document__node"
    ) >= 0
  ) {
    startChildNode = range.startContainer.parentNode.parentNode;
    isCaptionNode = true;
  } else {
    startChildNode = range.startContainer.parentNode;
    isCaptionNode = false;
  }
  if (startParentContainer) {
    indexOfStartContainer = Array.prototype.indexOf.call(
      startParentContainer.childNodes, //Arrange siblings into an array
      startChildNode
    ); //Find indexOf current Node
  } else {
    indexOfStartContainer = -1;
  }

  let indexOfEndContainer;

  let endParentContainer = findAncestor(range.endContainer, textIndexClassName);
  let endChildNode;
  if (
    range.endContainer.parentNode &&
    (range.endContainer.parentNode as HTMLElement).className.indexOf(
      "document__node"
    ) >= 0
  ) {
    endChildNode = range.endContainer.parentNode.parentNode;
  } else {
    endChildNode = range.endContainer.parentNode;
  }
  if (endParentContainer) {
    indexOfEndContainer = Array.prototype.indexOf.call(
      endParentContainer.childNodes, //Arrange siblings into an array
      endChildNode
    ); //Find indexOf current Node
  } else {
    indexOfEndContainer = -1;
  }

  const indexOfSelectionStart: number = range.startOffset;
  const indexOfSelectionEnd: number = range.endOffset;

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

  let startContainer;
  let endContainer;
  let wordCountBeforeSelection = 0;
  if (
    rowIndex !== undefined &&
    rowInnerIndex !== undefined &&
    textIndex !== undefined
  ) {
    if (isCaptionNode) {
      startContainer =
        firstNodeList[rowIndex].childNodes[rowInnerIndex].childNodes[textIndex]
          .childNodes[indexOfStartContainer].childNodes[0];
      endContainer =
        firstNodeList[rowIndex].childNodes[rowInnerIndex].childNodes[textIndex]
          .childNodes[indexOfEndContainer].childNodes[0];

      if (startContainer.parentNode) {
        let prevSib = startContainer.parentNode.previousSibling;
        while (prevSib) {
          let prevSibChild = prevSib.childNodes[0];
          if (prevSibChild && prevSibChild.textContent) {
            wordCountBeforeSelection += prevSibChild.textContent.split(" ")
              .length;
          }
          prevSib = prevSib.previousSibling;
        }
      }
    } else {
      startContainer =
        firstNodeList[rowIndex].childNodes[rowInnerIndex].childNodes[textIndex]
          .childNodes[indexOfStartContainer];
      endContainer =
        firstNodeList[rowIndex].childNodes[rowInnerIndex].childNodes[textIndex]
          .childNodes[indexOfEndContainer];

      let prevSib = startContainer.previousSibling;
      while (prevSib && prevSib.textContent) {
        wordCountBeforeSelection += prevSib.textContent.split(" ").length;
        prevSib = prevSib.previousSibling;
      }
    }
  }

  let newNodes: FoundationNode[] = [...nodes.slice(0, indexOfStartContainer)];

  let lengthOfSelection = 0;
  if (startContainer && startContainer === endContainer) {
    // Create a new Span element with the contents of the highlighted text
    let textContent;
    if (startContainer.textContent) {
      wordCountBeforeSelection += startContainer.textContent
        .substring(0, indexOfSelectionStart)
        .split(" ").length;

      textContent = startContainer.textContent.substring(
        indexOfSelectionStart,
        indexOfSelectionEnd
      );
    } else {
      textContent = "";
    }

    lengthOfSelection += textContent.split(" ").length;

    let newSpan: React.ReactNode = React.createElement(
      "span",
      {
        className: foundationClassName,
        key: "someKey",
        onClick: () => handleSetClick()
      },
      textContent
    );

    // Modify state array immutably
    let newNode: FoundationNode = (Object as any).assign(
      {},
      nodes[indexOfStartContainer]
    );

    let startText;
    let endText;
    if (startContainer.textContent) {
      startText = startContainer.textContent.substring(
        0,
        indexOfSelectionStart
      );
      endText = startContainer.textContent.substring(
        indexOfSelectionEnd,
        startContainer.textContent.length
      );
    } else {
      startText = "";
      endText = "";
    }

    newNode.innerHTML = [startText, newSpan, endText];

    newNodes = [...newNodes, newNode];
  } else if (startContainer && endContainer) {
    let textContent;
    if (startContainer.textContent) {
      wordCountBeforeSelection += startContainer.textContent
        .substring(0, indexOfSelectionStart)
        .split(" ").length;
      textContent = startContainer.textContent.substring(
        indexOfSelectionStart,
        startContainer.textContent.length
      );
    } else {
      textContent = "";
    }

    lengthOfSelection += textContent.split(" ").length;

    // Create a new Span element with the contents of the highlighted text
    let firstNewSpan: React.ReactNode = React.createElement(
      "span",
      {
        className: foundationClassName,
        key: "someKey",
        onClick: () => handleSetClick()
      },
      textContent
    );

    // Modify state array immutably
    let firstNewNode: FoundationNode = (Object as any).assign(
      {},
      nodes[indexOfStartContainer]
    );

    let startText;
    if (startContainer.textContent) {
      startText = startContainer.textContent.substring(
        0,
        indexOfSelectionStart
      );
    } else {
      startText = "";
    }

    firstNewNode.innerHTML = [startText, firstNewSpan];

    newNodes = [...newNodes, firstNewNode];

    for (
      let index: number = indexOfStartContainer + 1;
      index < indexOfEndContainer;
      index++
    ) {
      let nextNewNode: FoundationNode = (Object as any).assign(
        {},
        nodes[index]
      );

      lengthOfSelection += nextNewNode.innerHTML.toString().split(" ").length;

      let nextNewSpan: React.ReactNode = React.createElement(
        "span",
        {
          className: foundationClassName,
          key: "someKey",
          onClick: () => handleSetClick()
        },
        nextNewNode.innerHTML
      );

      nextNewNode.innerHTML = [nextNewSpan];

      newNodes = [...newNodes, nextNewNode];
    }

    if (endContainer.textContent) {
      textContent = endContainer.textContent.substring(0, indexOfSelectionEnd);
    } else {
      textContent = "";
    }

    lengthOfSelection += textContent.split(" ").length;

    // Create a new Span element with the contents of the highlighted text
    let lastNewSpan: React.ReactNode = React.createElement(
      "span",
      {
        className: foundationClassName,
        key: "someKey",
        onClick: () => handleSetClick()
      },
      textContent
    );
    // Modify state array immutably
    let lastNewNode: FoundationNode = (Object as any).assign(
      {},
      nodes[indexOfEndContainer]
    );
    let endText;
    if (endContainer.textContent) {
      endText = endContainer.textContent.substring(
        indexOfSelectionEnd,
        endContainer.textContent.length
      );
    } else {
      endText = "";
    }

    lastNewNode.innerHTML = [lastNewSpan, endText];

    newNodes = [...newNodes, lastNewNode];
  }

  newNodes = [
    ...newNodes,
    ...nodes.slice(indexOfEndContainer + 1, nodes.length)
  ];

  clearDefaultDOMSelection();

  let viewRangeStart;
  let highlightedCharacterRangeStart;
  let viewRangeEnd;
  let highlightedCharacterRangeEnd;

  let startData = nodes[indexOfStartContainer];
  if (startData) {
    viewRangeStart = startData.props.offset;
    highlightedCharacterRangeStart = viewRangeStart + indexOfSelectionStart;
  } else {
    viewRangeStart = -1;
    highlightedCharacterRangeStart = -1;
  }

  let endData = nodes[indexOfEndContainer];
  if (endData) {
    viewRangeEnd = endData.props.offset + endData.innerHTML.toString().length;
    highlightedCharacterRangeEnd = endData.props.offset + indexOfSelectionEnd;
  } else {
    viewRangeEnd = -1;
    highlightedCharacterRangeEnd = -1;
  }

  return {
    newNodes: newNodes,
    highlightedCharacterRange: [
      highlightedCharacterRangeStart,
      highlightedCharacterRangeEnd
    ],
    viewRange: [viewRangeStart, viewRangeEnd],
    highlightedWordRange: [
      wordCountBeforeSelection - 1,
      wordCountBeforeSelection - 1 + lengthOfSelection
    ]
  };
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
  const excerpt = getDocumentFact(excerptId);
  let source;
  if (excerpt) {
    source = require("../foundation/" + excerpt.filename);
  } else {
    throw "Error retrieving Foundation document";
  }

  if (source) {
    const output: Array<FoundationNode> = [];
    const components: FoundationComponent[] = JSON.parse(source);
    let offset = 0;
    for (const component of components) {
      output.push({
        component: component.component,
        props: {
          offset: offset
        },
        innerHTML: [component.innerHTML]
      });
      offset += component.innerHTML.length;
    }

    return output;
  } else {
    throw "Error retrieving Foundation document";
  }
}
function convertTimestampToSeconds(timestamp: string): number {
  // Parse data string in form HH:MM:SS.SSS
  const HH = parseInt(timestamp.split(":")[0]);
  const MM = parseInt(timestamp.split(":")[1]);
  const SS = parseInt(timestamp.split(":")[2]);

  // Convert HHMMSS to seconds
  return HH * 60 * 60 + MM * 60 + SS;
}

function getCaptionNodeArray(videoId: string): Array<FoundationNode> {
  // Fetch the excerpt from the DB by its ID
  const captionFile = getVideoFactCaptionFile(videoId);
  let source;
  if (captionFile) {
    source = require("../foundation/" + captionFile);
    if (source) {
      const captionMeta = getVideoCaptionMetaData(videoId);
      let output: Array<FoundationNode> = [];
      let offset = 0;
      if (captionMeta) {
        const speakerMap = captionMeta.speakerMap;
        const captions: CaptionWord[] = JSON.parse(source);
        for (const speaker of speakerMap) {
          let innerHTML = "";
          for (let i = speaker.range[0]; i <= speaker.range[1]; i++) {
            if (captions[i]) {
              innerHTML += captions[i].word;
            }
          }

          innerHTML = innerHTML.trim(); //Replace extra whitespace with a single space

          if (innerHTML.length > 0) {
            output.push({
              component: "p",
              props: {
                offset: offset
              },
              innerHTML: [innerHTML]
            });

            // Character count offset
            offset += innerHTML.length;
          } else {
            // Likely an error in the databaseData if we're here.
            // A speaker's start range is greater than end range.
            // console.log(speaker.range) to find the offending range.
          }
        }
      }
      return output;
    } else {
      throw "Error retrieving Caption document";
    }
  } else {
    throw "Error retrieving Caption document";
  }
}

const validators = {
  isValidUser: (user: string): boolean => {
    // User must be alphanumeric
    if (user.match(/^[a-z0-9]+$/i)) {
      return true;
    }
    return false;
  },
  isValidTitle: (title: string): boolean => {
    // Title must be alphanumeric, hyphens and underscores are also allowed
    if (title.match(/^[a-z0-9\-\_]+$/i)) {
      return true;
    }
    return false;
  }
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-") //replace spaces with hyphens
    .replace(/[-]+/g, "-") //replace multiple hyphens with single hyphen
    .replace(/[^\w-]+/g, ""); //remove non-alphanumics and non-hyphens
}

function getFact(factId: string): DocumentFact | VideoFact {
  try {
    return getDocumentFact(factId);
  } catch (err) {
    try {
      return getVideoFact(factId);
    } catch (err) {
      throw err;
    }
  }
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

  let paragraphNode = textNode.parentNode;

  if (paragraphNode) {
    let captionBlock = paragraphNode.parentNode;

    while (captionBlock && captionBlock.previousSibling) {
      captionBlock = captionBlock.previousSibling;
      let prevTextNode = captionBlock.childNodes[0];
      if (prevTextNode.textContent) {
        wordCount += prevTextNode.textContent.toString().split(" ").length;
      }
    }
  }

  return wordCount;
}

function getCharRangeFromVideoRange(
  videoId: string,
  timeRange: [number, number]
): [number, number] {
  const startTime = timeRange[0];
  const endTime = timeRange[1];

  const wordMap = getVideoCaptionWordMap(videoId);
  let charCount = 0;
  let startCharIndex: number = -1;
  let isStartSet = false;
  let endCharIndex: number = -1;

  for (const captionWord of wordMap) {
    if (captionWord.timestamp < startTime) {
      charCount += captionWord.word.length;
      continue;
    }
    if (!isStartSet) {
      startCharIndex = charCount;
      isStartSet = true;
    }
    if (captionWord.timestamp < endTime) {
      charCount += captionWord.word.length;
      continue;
    }
    endCharIndex = charCount;
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
    (htmlRange.startContainer.parentNode as HTMLElement).className.indexOf(
      "document__node"
    ) >= 0
  ) {
    return true;
  } else {
    return false;
  }
}

interface ClassNames {
  rowIndex: string;
  rowInnerIndex: string;
  textIndex: string;
}

function getContainer(
  nodes: NodeList,
  containerIndex: number,
  classNames: ClassNames
): Node {
  let rowIndex;
  let firstNodeList = nodes;
  for (let i = 0; i < firstNodeList.length; i++) {
    for (let j = 0; j < firstNodeList[i].attributes.length; j++) {
      if (
        (firstNodeList[i] as HTMLElement).classList.contains(
          classNames.rowIndex
        )
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
            classNames.rowInnerIndex
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
  } else {
    throw "Couldn't find nodes in " + classNames.rowIndex;
  }

  let textIndex;
  let thirdNodeList;
  if (secondNodeList && rowInnerIndex !== undefined) {
    thirdNodeList = secondNodeList[rowInnerIndex].childNodes;
    for (let i = 0; i < thirdNodeList.length; i++) {
      for (let j = 0; j < thirdNodeList[i].attributes.length; j++) {
        if (
          (thirdNodeList[i] as HTMLElement).classList.contains(
            classNames.textIndex
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
  } else {
    throw "Couldn't find nodes in " + classNames.rowInnerIndex;
  }

  if (textIndex !== undefined) {
    return firstNodeList[rowIndex].childNodes[rowInnerIndex].childNodes[
      textIndex
    ].childNodes[containerIndex];
  } else {
    throw "Couldn't find nodes in " + classNames.textIndex;
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
  const classNames: ClassNames = {
    rowIndex: "document__row",
    rowInnerIndex: "document__row-inner",
    textIndex: "document__text"
  };

  let startChildNode: Node | null;
  let endChildNode: Node | null;
  const isCaption = isCaptionNode(htmlRange);
  if (isCaption) {
    if (
      htmlRange.startContainer.parentNode &&
      htmlRange.endContainer.parentNode
    ) {
      startChildNode = htmlRange.startContainer.parentNode.parentNode;
      endChildNode = htmlRange.endContainer.parentNode.parentNode;
    } else {
      throw "Unexpcected HTML structure";
    }
  } else {
    startChildNode = htmlRange.startContainer.parentNode;
    endChildNode = htmlRange.endContainer.parentNode;
  }

  const startParentContainer = findAncestor(
    htmlRange.startContainer,
    classNames.textIndex
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
    classNames.textIndex
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
    startContainer = startContainer.childNodes[0];
    endContainer = endContainer.childNodes[0];

    // Get word and char counts
    if (startContainer.parentNode) {
      let prevSib = startContainer.parentNode.previousSibling;
      while (prevSib) {
        const prevSibChild = prevSib.childNodes[0];
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

function highlightTextTwo(
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
  convertTimestampToSeconds,
  getCaptionNodeArray,
  getCharRangeFromVideoRange,
  getFact,
  getSimpleRangesFromHTMLRange,
  getStartRangeOffsetTop,
  getHighlightedNodes,
  getNodesInRange,
  getNodeArray,
  getWordCount,
  highlightText,
  highlightTextTwo,
  HighlightedText,
  slugify,
  validators
};

export default {};
