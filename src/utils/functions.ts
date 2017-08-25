import * as React from "react";
import {
  FoundationNode,
  FoundationTextType,
  FoundationNodeProps
} from "../components/Foundation";
var htmlparser = require("htmlparser2");
const constitutionText = require("../foundation/constitution.foundation.html");
const amendmentsText = require("../foundation/amendments.foundation.html");

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

function getHighlightedNodes(
  nodes: FoundationNode[],
  range: [number, number]
): FoundationNode[] {
  const startRange = range[0];
  const endRange = range[1];
  let documentNodes: FoundationNode[] = [];
  let highlightedNodes: FoundationNode[] = [];
  for (let idx = 0; idx < nodes.length; idx++) {
    if (nodes[idx + 1]) {
      if (parseInt(nodes[idx + 1].props.data) <= startRange) {
        continue;
      }
    }
    if (parseInt(nodes[idx].props.data) > endRange) {
      break;
    }
    documentNodes = [...documentNodes, ...nodes.slice(idx, idx + 1)];
  }
  // documentNodes is a new array with only the nodes containing text to be highlighted
  if (documentNodes.length === 1) {
    const offset = parseInt(documentNodes[0].props.data);
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
    let offset = parseInt(documentNodes[0].props.data);
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
      offset = parseInt(documentNodes[index].props.data);
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
  range: [number, number];
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

  const indexOfStartContainer: number = Array.prototype.indexOf.call(
    range.startContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
    range.startContainer.parentNode
  ); //Find indexOf current Node

  const indexOfSelectionStart: number = range.startOffset;

  const indexOfEndContainer: number = Array.prototype.indexOf.call(
    range.endContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
    range.endContainer.parentNode
  ); //Find indexOf current Node

  const indexOfSelectionEnd: number = range.endOffset;

  let rowIndex;
  let firstNodeList = childNodes;
  for (let i = 0; i < firstNodeList.length; i++) {
    for (let j = 0; j < firstNodeList[i].attributes.length; j++) {
      if (firstNodeList[i].attributes.item(j).value == rowIndexClassName) {
        rowIndex = i;
        break;
      }
    }
    if (rowIndex !== undefined) {
      break;
    }
  }

  let rowInnerIndex;
  let secondNodeList = firstNodeList[rowIndex].childNodes;
  for (let i = 0; i < secondNodeList.length; i++) {
    for (let j = 0; j < secondNodeList[i].attributes.length; j++) {
      if (
        secondNodeList[i].attributes.item(j).value == rowInnerIndexClassName
      ) {
        rowInnerIndex = i;
        break;
      }
    }
    if (rowInnerIndex !== undefined) {
      break;
    }
  }

  let textIndex;
  let thirdNodeList = secondNodeList[rowInnerIndex].childNodes;
  for (let i = 0; i < thirdNodeList.length; i++) {
    for (let j = 0; j < thirdNodeList[i].attributes.length; j++) {
      if (thirdNodeList[i].attributes.item(j).value == textIndexClassName) {
        textIndex = i;
        break;
      }
    }
    if (textIndex !== undefined) {
      break;
    }
  }

  const startContainer: Node =
    firstNodeList[rowIndex].childNodes[rowInnerIndex].childNodes[textIndex]
      .childNodes[indexOfStartContainer];
  const endContainer: Node =
    firstNodeList[rowIndex].childNodes[rowInnerIndex].childNodes[textIndex]
      .childNodes[indexOfEndContainer];

  let newNodes: Array<FoundationNode> = [
    ...nodes.slice(0, indexOfStartContainer)
  ];

  if (startContainer === endContainer) {
    // Create a new Span element with the contents of the highlighted text
    let newSpan: React.ReactNode = React.createElement(
      "span",
      {
        className: foundationClassName,
        key: "someKey",
        onClick: handleSetClick
      },
      startContainer.textContent.substring(
        indexOfSelectionStart,
        indexOfSelectionEnd
      )
    );

    // Modify state array immutably
    let newNode: FoundationNode = (Object as any).assign(
      {},
      nodes[indexOfStartContainer]
    );
    newNode.innerHTML = [
      startContainer.textContent.substring(0, indexOfSelectionStart),
      newSpan,
      startContainer.textContent.substring(
        indexOfSelectionEnd,
        startContainer.textContent.length
      )
    ];

    newNodes = [...newNodes, newNode];
  } else {
    // Create a new Span element with the contents of the highlighted text
    let firstNewSpan: React.ReactNode = React.createElement(
      "span",
      {
        className: foundationClassName,
        key: "someKey",
        onClick: handleSetClick
      },
      startContainer.textContent.substring(
        indexOfSelectionStart,
        startContainer.textContent.length
      )
    );

    // Modify state array immutably
    let firstNewNode: FoundationNode = (Object as any).assign(
      {},
      nodes[indexOfStartContainer]
    );
    firstNewNode.innerHTML = [
      startContainer.textContent.substring(0, indexOfSelectionStart),
      firstNewSpan
    ];

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
          onClick: handleSetClick
        },
        nextNewNode.innerHTML
      );
      nextNewNode.innerHTML = [nextNewSpan];

      newNodes = [...newNodes, nextNewNode];
    }

    // Create a new Span element with the contents of the highlighted text
    let lastNewSpan: React.ReactNode = React.createElement(
      "span",
      {
        className: foundationClassName,
        key: "someKey",
        onClick: handleSetClick
      },
      endContainer.textContent.substring(0, indexOfSelectionEnd)
    );
    // Modify state array immutably
    let lastNewNode: FoundationNode = (Object as any).assign(
      {},
      nodes[indexOfEndContainer]
    );
    lastNewNode.innerHTML = [
      lastNewSpan,
      endContainer.textContent.substring(
        indexOfSelectionEnd,
        endContainer.textContent.length
      )
    ];

    newNodes = [...newNodes, lastNewNode];
  }

  newNodes = [
    ...newNodes,
    ...nodes.slice(indexOfEndContainer + 1, nodes.length)
  ];

  clearDefaultDOMSelection();

  const rangeStart =
    parseInt(startContainer.attributes[0].value) + indexOfSelectionStart;
  const rangeEnd =
    parseInt(endContainer.attributes[0].value) + indexOfSelectionEnd;

  return {
    newNodes: newNodes,
    range: [rangeStart, rangeEnd]
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
      if (firstNodeList[i].attributes.item(j).value == rowIndexClassName) {
        rowIndex = i;
        break;
      }
    }
    if (rowIndex !== undefined) {
      break;
    }
  }

  let rowInnerIndex;
  let secondNodeList = firstNodeList[rowIndex].childNodes;
  for (let i = 0; i < secondNodeList.length; i++) {
    for (let j = 0; j < secondNodeList[i].attributes.length; j++) {
      if (
        secondNodeList[i].attributes.item(j).value == rowInnerIndexClassName
      ) {
        rowInnerIndex = i;
        break;
      }
    }
    if (rowInnerIndex !== undefined) {
      break;
    }
  }

  let textIndex;
  let thirdNodeList = secondNodeList[rowInnerIndex].childNodes;
  for (let i = 0; i < thirdNodeList.length; i++) {
    for (let j = 0; j < thirdNodeList[i].attributes.length; j++) {
      if (thirdNodeList[i].attributes.item(j).value == textIndexClassName) {
        textIndex = i;
        break;
      }
    }
    if (textIndex !== undefined) {
      break;
    }
  }

  let textNodes = thirdNodeList[textIndex].childNodes;
  let resultNodes;
  for (let idx = 0; idx < textNodes.length; idx++) {
    if (textNodes[idx + 1]) {
      if (parseInt(textNodes[idx].attributes[0].value) < startRange) {
        continue;
      }
    }
    if (parseInt(textNodes[idx].attributes[0].value) > endRange) {
      break;
    }
    resultNodes = textNodes[idx];
  }

  let offsetTop = (resultNodes as HTMLElement).offsetTop;
  return offsetTop;
  //(secondNodeList[documentIndex] as HTMLElement).scrollTop = offsetTop;
  //return resultNodes;
}

/**
 *  Create an array of React elements for each Node in a given HTML string.
 * 
 *  Assumes no child nodes in HTML string input.
 */

function getNodeArray(type: FoundationTextType): Array<FoundationNode> {
  let source;
  switch (type) {
    case "AMENDMENTS":
      source = amendmentsText;
      break;
    case "CONSTITUTION":
      source = constitutionText;
      break;
    default:
      break;
  }

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
}

export {
  clearDefaultDOMSelection,
  getStartRangeOffsetTop,
  getHighlightedNodes,
  getNodeArray,
  highlightText,
  HighlightedText
};

export default {};
