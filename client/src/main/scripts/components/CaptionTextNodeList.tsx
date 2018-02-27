import * as React from "react";
import * as ReactDOM from "react-dom";
import { CaptionNode, CaptionNodeArr } from "../utils/functions";
import CaptionTextNode from "./CaptionTextNode";
import isEqual = require("lodash/isEqual");
import { Foundation } from "../java2ts/Foundation";

export interface CaptionTextNodeListEventHandlers {
  onMouseUp: () => any;
  onScroll: () => any;
}

interface CaptionTextNodeListProps {
  documentNodes: CaptionNodeArr;
  eventHandlers: CaptionTextNodeListEventHandlers;
  videoFact: Foundation.VideoFactContentFast;
}

interface CaptionTextNodeListState {}

class CaptionTextNodeList extends React.Component<
  CaptionTextNodeListProps,
  CaptionTextNodeListState
> {
  private captionNodeContainer: HTMLDivElement | null;
  constructor(props: CaptionTextNodeListProps) {
    super(props);
  }
  getContainer = (): HTMLDivElement | null => {
    if (this.captionNodeContainer) {
      return this.captionNodeContainer;
    }
    return null;
  };
  shouldComponentUpdate(
    nextProps: CaptionTextNodeListProps,
    nextState: CaptionTextNodeListState
  ) {
    if (isEqual(this.props.documentNodes, nextProps.documentNodes)) {
      return false;
    }
    return true;
  }
  render() {
    let wordCount: number;
    let nextWordCount: number;
    return (
      <div
        className="document__text document__text--caption"
        onMouseUp={this.props.eventHandlers.onMouseUp}
        onScroll={this.props.eventHandlers.onScroll}
        ref={(div: HTMLDivElement) => {
          this.captionNodeContainer = div;
        }}
      >
        {this.props.documentNodes.map(
          function(element: CaptionNode, index: number) {
            return (
              <CaptionTextNode
                key={index}
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
    );
  }
}

export default CaptionTextNodeList;
