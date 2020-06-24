import * as React from "react";
import { Foundation } from "../java2ts/Foundation";
import { FoundationNode } from "../common/CaptionNodes";
import {
  DocumentBlock,
  TakeBlock,
  VideoBlock,
} from "../components/BlockEditor";
var bs = require("binary-search");

export function getNodesInRange(
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

export function getHighlightedNodes(
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
        key: "somekey",
      },
      documentNodes[0].innerHTML.toString().substring(startIndex, endIndex)
    );
    let newNode: FoundationNode = (Object as any).assign({}, documentNodes[0]);
    const length = documentNodes[0].innerHTML.toString().length;
    newNode.innerHTML = [
      newNode.innerHTML.toString().substring(0, startIndex),
      newSpan,
      newNode.innerHTML.toString().substring(endIndex, length),
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
        key: "somekey",
      },
      documentNodes[0].innerHTML.toString().substring(startIndex, endIndex)
    );

    let newNode: FoundationNode = (Object as any).assign({}, documentNodes[0]);
    newNode.innerHTML = [
      newNode.innerHTML.toString().substring(0, startIndex),
      newSpan,
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
          key: "somekey",
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
        newNode.innerHTML.toString().substring(endIndex, length),
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
export function getStartRangeOffsetTop(
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
    for (
      let j = 0;
      j < (firstNodeList[i] as HTMLElement).attributes.length;
      j++
    ) {
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
      for (
        let j = 0;
        j < (secondNodeList[i] as HTMLElement).attributes.length;
        j++
      ) {
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
      for (
        let j = 0;
        j < (thirdNodeList[i] as HTMLElement).attributes.length;
        j++
      ) {
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

export function convertSecondsToTimestamp(totalSeconds: number): string {
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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-") //replace spaces with hyphens
    .replace(/[-]+/g, "-") //replace multiple hyphens with single hyphen
    .replace(/[^\w-]+/g, ""); //remove non-alphanumics and non-hyphens
}

export function getWordCount(selection: Selection): number {
  // Cursor is in a block of caption text

  // Get the text Node
  const textNode = selection.anchorNode;

  // Get the character offset of the cursor position in the Node
  const anchorOffset = selection.anchorOffset;

  // Get the word offset of the cursor position in the Node
  let wordCount;
  if (textNode?.textContent) {
    wordCount = textNode.textContent
      .toString()
      .substring(0, anchorOffset)
      .split(" ").length;
  } else {
    wordCount = 0;
  }

  let paragraphNode;
  if (textNode?.parentNode) {
    paragraphNode = textNode.parentNode.parentNode;
  } else {
    alertErr("functions: Unknown HTML Structure");
    throw "Unknown HTML Structure";
  }

  if (paragraphNode && paragraphNode.parentNode) {
    let captionBlock: Node = paragraphNode.parentNode;

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

export function getSimpleRangesFromHTMLRange(
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
      "document__text--caption",
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
      viewRange: [viewStart, viewEnd],
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
        viewRange: [viewStart, viewEnd],
      };
    } else {
      alertErr("functions: Unexpcected HTML structure");
      throw "Unexpected HTML structure";
    }
  }
}

export function getWordRangeFromCharRange(
  charRange: [number, number],
  videoFact: Foundation.VideoFactContent
): [number, number] {
  const firstChar = charRange[0];
  const lastChar = charRange[1];

  const comparator = (element: number, needle: number) => {
    return element - needle;
  };

  let firstWordIdx = bs(videoFact.charOffsets, firstChar, comparator);

  if (firstWordIdx < 0) {
    firstWordIdx = -firstWordIdx - 2;
    if (firstWordIdx < 0) {
      // If still negative, it means we're at the first word
      firstWordIdx = 0;
    }
  }

  let lastWordIdx = bs(videoFact.charOffsets, lastChar + 1, comparator);

  if (lastWordIdx < 0) {
    lastWordIdx = -lastWordIdx - 2;
    if (lastWordIdx < 0) {
      // If still negative, it means we're at the first word
      lastWordIdx = 0;
    }
  }

  lastWordIdx -= 1;

  return [firstWordIdx, lastWordIdx];
}

export function highlightText(
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
            onClick: () => handleSetClick(),
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
            onClick: () => handleSetClick(),
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
          onClick: () => handleSetClick(),
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
          onClick: () => handleSetClick(),
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

export function alertErr(errMsg: string) {
  const msg =
    "Something went wrong. To help us figure it out, please copy and paste the information from below into an email to team@mytake.org. Thank you." +
    "\n\n" +
    "Error message: " +
    errMsg +
    "\nURL: " +
    window.location.href;
  alert(msg);
}

function getCookieValue(a: string): string {
  // https://stackoverflow.com/questions/5639346/what-is-the-shortest-function-for-reading-a-cookie-by-name-in-javascript?noredirect=1&lq=1
  const b = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)");
  if (b) {
    const c = b.pop();
    return c ? c : "";
  }
  return "";
}
export function getUserCookieString(): string {
  return getCookieValue("loginui");
}
export function copyToClipboard(text: string): boolean {
  const textArea = document.createElement("textarea");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    const success = document.execCommand("copy");
  } catch (err) {
    const msg = "Video: Unable to copy text";
    alertErr(msg);
    throw msg;
  }
  document.body.removeChild(textArea);
  return true;
}
export function getUsernameFromURL(): string {
  return window.location.pathname.split("/")[1];
}
export function isLoggedIn(): boolean {
  return getUserCookieString() ? true : false;
}
export function ancestorHasClass(
  element: HTMLElement | null,
  classname: string
): boolean {
  if (element) {
    if (element.classList.contains(classname)) {
      return true;
    }
    return ancestorHasClass(element.parentElement, classname);
  } else {
    return false;
  }
}
export function getFirstFactBlock(
  blockList: TakeBlock[]
): VideoBlock | DocumentBlock | null {
  for (let block of blockList) {
    if (block.kind === "document" || block.kind === "video") {
      return block;
    }
  }
  return null;
}
