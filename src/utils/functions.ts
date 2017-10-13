import * as React from "react";
import { CaptionWord, DocumentFact, VideoFact } from "./databaseData";
import {
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
  highlightedRange: [number, number];
  viewRange: [number, number];
  videoRange: [number, number];
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

  let indexOfStartContainer = 0;
  if (
    range.startContainer.parentElement &&
    range.startContainer.parentElement.parentNode
  ) {
    indexOfStartContainer = Array.prototype.indexOf.call(
      range.startContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
      range.startContainer.parentNode
    ); //Find indexOf current Node
  }

  let indexOfEndContainer = 0;
  if (
    range.endContainer.parentElement &&
    range.endContainer.parentElement.parentNode
  ) {
    indexOfEndContainer = Array.prototype.indexOf.call(
      range.endContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
      range.endContainer.parentNode
    ); //Find indexOf current Node
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
  if (
    rowIndex !== undefined &&
    rowInnerIndex !== undefined &&
    textIndex !== undefined
  ) {
    startContainer =
      firstNodeList[rowIndex].childNodes[rowInnerIndex].childNodes[textIndex]
        .childNodes[indexOfStartContainer];
    endContainer =
      firstNodeList[rowIndex].childNodes[rowInnerIndex].childNodes[textIndex]
        .childNodes[indexOfEndContainer];
  }

  let newNodes: Array<FoundationNode> = [
    ...nodes.slice(0, indexOfStartContainer)
  ];

  if (startContainer && startContainer === endContainer) {
    // Create a new Span element with the contents of the highlighted text
    let textContent;
    if (startContainer.textContent) {
      textContent = startContainer.textContent.substring(
        indexOfSelectionStart,
        indexOfSelectionEnd
      );
    } else {
      textContent = "";
    }

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
      textContent = startContainer.textContent.substring(
        indexOfSelectionStart,
        startContainer.textContent.length
      );
    } else {
      textContent = "";
    }

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

    textContent;
    if (endContainer.textContent) {
      textContent = endContainer.textContent.substring(0, indexOfSelectionEnd);
    } else {
      textContent = "";
    }

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

  let startData = nodes[indexOfStartContainer].props;
  let viewRangeStart = startData.offset;
  let highlightedRangeStart = viewRangeStart + indexOfSelectionStart;

  let endData = nodes[indexOfEndContainer];
  let viewRangeEnd = endData.props.offset;
  let highlightedRangeEnd = viewRangeEnd + indexOfSelectionEnd;
  if (endData.innerHTML) {
    viewRangeEnd += endData.innerHTML.toString().length;
  }

  return {
    newNodes: newNodes,
    highlightedRange: [highlightedRangeStart, highlightedRangeEnd],
    viewRange: [viewRangeStart, viewRangeEnd],
    videoRange: [0, 0]
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
        let dataOffset = (textNodes[idx] as HTMLElement).dataset.offset;
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

function getNodeArray(excerptId: string): Array<FoundationNode> {
  // Fetch the excerpt from the DB by its ID
  const excerpt = getDocumentFact(excerptId);
  let source;
  if (excerpt) {
    source = require("../foundation/" + excerpt.filename);
  } else {
    return getCaptionNodeArray(excerptId);
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
  const SS = parseInt(timestamp.split(":")[2].split(".")[0]);

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
              innerHTML += " " + captions[i].word;
            }
          }
          let startTime = convertTimestampToSeconds(
            captions[speaker.range[0]].timestamp
          );
          let endTime = convertTimestampToSeconds(
            captions[speaker.range[0]].timestamp
          );

          // Append a separator and a character count offset
          let dataValue = startTime.toString() + "|" + endTime.toString() + "|";

          // Character count offset
          offset += dataValue.length + 10 + innerHTML.length;
          offset += offset.toString().length;

          dataValue += offset.toString();

          output.push({
            component: "p",
            props: {
              offset: parseInt(dataValue)
            },
            innerHTML: [innerHTML]
          });
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

function getFact(factId: string): DocumentFact | VideoFact | null {
  let excerpt = getDocumentFact(factId);

  if (excerpt) {
    return excerpt;
  }

  let video = getVideoFact(factId);

  if (video) {
    return video;
  }

  return null;
}

export {
  clearDefaultDOMSelection,
  getCaptionNodeArray,
  getFact,
  getStartRangeOffsetTop,
  getHighlightedNodes,
  getNodesInRange,
  getNodeArray,
  highlightText,
  HighlightedText,
  slugify,
  validators
};

export default {};
