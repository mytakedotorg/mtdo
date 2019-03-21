import * as React from "react";
import { FoundationNode } from "./CaptionNodes";

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
