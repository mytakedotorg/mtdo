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
  key: string;
  data?: string;
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
      if (parseInt((nodes[idx + 1].props as any).data) <= startRange) {
        continue;
      }
    }
    if (parseInt((nodes[idx].props as any).data) > endRange) {
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
  let documentNodes = getNodesInRange(nodes, range);
  let highlightedNodes: FoundationNode[] = [];
  // documentNodes is a new array with only the nodes containing text to be highlighted
  if (documentNodes.length === 1) {
    const offset = parseInt((documentNodes[0].props as any).data);
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
  } else {
    // More than one DOM node highlighted
    let offset = parseInt((documentNodes[0].props as any).data);
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
      offset = parseInt((documentNodes[index].props as any).data);
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
    let textContent = "";
    if (startContainer.textContent) {
      textContent = startContainer.textContent.substring(
        indexOfSelectionStart,
        indexOfSelectionEnd
      );
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

    let startText = "";
    let endText = "";
    if (startContainer.textContent) {
      startText = startContainer.textContent.substring(
        0,
        indexOfSelectionStart
      );
      endText = startContainer.textContent.substring(
        indexOfSelectionEnd,
        startContainer.textContent.length
      );
    }
    newNode.innerHTML = [startText, newSpan, endText];

    newNodes = [...newNodes, newNode];
  } else if (startContainer && endContainer) {
    let textContent = "";
    if (startContainer.textContent) {
      textContent = startContainer.textContent.substring(
        indexOfSelectionStart,
        startContainer.textContent.length
      );
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

    let startText = "";
    if (startContainer.textContent) {
      startText = startContainer.textContent.substring(
        0,
        indexOfSelectionStart
      );
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

    textContent = "";
    if (endContainer.textContent) {
      textContent = endContainer.textContent.substring(0, indexOfSelectionEnd);
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
    let endText = "";
    if (endContainer.textContent) {
      endText = endContainer.textContent.substring(
        indexOfSelectionEnd,
        endContainer.textContent.length
      );
    }
    lastNewNode.innerHTML = [lastNewSpan, endText];

    newNodes = [...newNodes, lastNewNode];
  }

  newNodes = [
    ...newNodes,
    ...nodes.slice(indexOfEndContainer + 1, nodes.length)
  ];

  clearDefaultDOMSelection();

  let highlightedRangeStart = 0;
  let highlightedRangeEnd = 0;
  let viewRangeStart = 0;
  let viewRangeEnd = 0;
  let videoStart = 0;
  let videoEnd = 0;
  if (startContainer && endContainer) {
    let startData = startContainer.attributes[0].value;
    if (startData.indexOf("|") !== -1) {
      // data looks like 0|5|16 for example
      viewRangeStart = parseInt(startData.split("|")[2]);
      videoStart = parseInt(startData.split("|")[0]);
    } else {
      viewRangeStart = parseInt(startData);
    }
    highlightedRangeStart = viewRangeStart + indexOfSelectionStart;

    let endData = endContainer.attributes[0].value;
    if (endData.indexOf("|") !== -1) {
      // data looks like 0|5|16 for example
      viewRangeEnd = parseInt(endData.split("|")[2]);
      videoEnd = parseInt(endData.split("|")[1]);
    } else {
      viewRangeEnd = parseInt(endData);
    }
    highlightedRangeEnd = viewRangeEnd + indexOfSelectionEnd;
    if (endContainer.textContent) {
      viewRangeEnd += endContainer.textContent.length;
    }
  }

  return {
    newNodes: newNodes,
    highlightedRange: [highlightedRangeStart, highlightedRangeEnd],
    viewRange: [viewRangeStart, viewRangeEnd],
    videoRange: [videoStart, videoEnd]
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
      if (textNodes[idx + 1]) {
        if (parseInt(textNodes[idx].attributes[0].value) <= startRange) {
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
      if (parseInt(textNodes[idx].attributes[0].value) > endRange) {
        break;
      }
      resultNodes = textNodes[idx];
    }
  }

  let offsetTop = (resultNodes as HTMLElement).offsetTop;
  return offsetTop;
}

/**
 *  Create an array of React elements for each Node in a given HTML string.
 * 
 *  Assumes no child nodes in HTML string input.
 */

function getNodeArray(excerptId: string): Array<FoundationNode> {
  // Fetch the excerpt from the DB by its ID
  let excerpt = getDocumentFact(excerptId);
  let source;
  if (excerpt) {
    source = require("../foundation/" + excerpt.filename);
  } else {
    return getCaptionNodeArray(excerptId);
  }

  if (source) {
    let output: Array<FoundationNode> = [];
    let tagIsOpen: boolean = false;
    let newElementName: string;
    let newElementProps: FoundationNodeProps;
    let newElementText: string;
    let iter = 0;

    var parser = new htmlparser.Parser({
      onopentag: function(name: string, attributes: FoundationNodeProps) {
        tagIsOpen = true;
        newElementName = name;
        newElementProps = attributes;
      },
      ontext: function(text: string) {
        if (tagIsOpen) {
          newElementText = text;
        }
        // Ignore text between tags, usually this is just a blank space
      },
      onclosetag: function(name: string) {
        tagIsOpen = false;
        output.push({
          component: newElementName,
          props: newElementProps,
          innerHTML: [newElementText]
        });
      },
      onerror: function(error: Error) {
        throw error;
      }
    });

    parser.write(source);
    parser.end();

    return output;
  } else {
    throw "Error retriving Foundation document";
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
      let charCount = 0;
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
          charCount += dataValue.length + 10 + innerHTML.length;
          charCount += charCount.toString().length;

          dataValue += charCount.toString();

          output.push({
            component: "p",
            props: {
              key: captions[speaker.range[0]].timestamp,
              data: dataValue
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
