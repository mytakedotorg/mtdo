/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
import * as React from "react";
import {
  FoundationNode,
  getHighlightedNodes,
  getNodesInRange,
  getSimpleRangesFromHTMLRange,
  getStartRangeOffsetTop,
  highlightText,
} from "../common/CaptionNodes";
import { FT } from "../java2ts/FT";
import { Routes } from "../java2ts/Routes";
import {} from "../utils/functions";
import Document, { DocumentEventHandlers } from "./Document";
import DocumentTextNodeList from "./DocumentTextNodeList";
import FactHeader, { StickyFactHeader } from "./FactHeader";
import Video from "./Video";
import isEqual = require("lodash/isEqual");

export interface SetFactHandlers {
  handleDocumentSetClick: (
    excerptId: string,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ) => void;
  handleVideoSetClick: (id: string, range: [number, number]) => void;
  handleRangeSet: (
    highlightRange: [number, number],
    viewRange?: [number, number]
  ) => void;
  handleRangeCleared: () => void;
}

export interface Ranges {
  highlightedRange: [number, number];
  viewRange?: [number, number];
}

interface TimelinePreviewProps {
  factLink: FT.FactLink;
  nodes?: FoundationNode[];
  videoFact?: FT.VideoFactContent;
  setFactHandlers?: SetFactHandlers;
  ranges?: Ranges;
  offset?: number;
}

interface TimelinePreviewState {
  highlightedRange: [number, number];
  viewRange: [number, number];
  textIsHighlighted: boolean;
  highlightedNodes: FoundationNode[];
  offsetTop: number;
}

export default class TimelinePreview extends React.Component<
  TimelinePreviewProps,
  TimelinePreviewState
> {
  private document: HTMLDivElement | null;
  constructor(props: TimelinePreviewProps) {
    super(props);

    this.state = {
      highlightedRange: props.ranges ? props.ranges.highlightedRange : [0, 0],
      viewRange:
        props.ranges && props.ranges.viewRange
          ? props.ranges.viewRange
          : [0, 0],
      textIsHighlighted: props.ranges ? true : false,
      highlightedNodes: [],
      offsetTop: 0,
    };
  }
  getScrollTop = (range?: [number, number]) => {
    // Get the scrollTop value of the top most HTML element containing the same highlighted nodes
    const childNodes = this.document?.childNodes;

    if (!childNodes) {
      throw "TimelinePreview: timeline preview ref is undefined";
    }

    const offsetTop = getStartRangeOffsetTop(
      childNodes,
      range ? range : this.state.viewRange
    );

    return offsetTop;
  };
  handleClearClick = () => {
    this.setState({
      textIsHighlighted: false,
      highlightedNodes: [],
    });
    if (this.props.setFactHandlers) {
      this.props.setFactHandlers.handleRangeCleared();
    }
  };
  handleMouseUp = () => {
    if (window.getSelection && !this.state.textIsHighlighted) {
      // Pre IE9 will always be false
      const selection = window.getSelection();
      if (selection?.toString().length) {
        //Some text is selected
        const range: Range = selection.getRangeAt(0);

        const childNodes = this.document?.childNodes;

        if (!childNodes) {
          throw "TimelinePreview: timeline preview ref is undefined";
        }

        const simpleRanges = getSimpleRangesFromHTMLRange(range, childNodes);
        const newNodes = highlightText(
          [...this.props.nodes],
          simpleRanges.charRange,
          this.handleSetClick
        );

        const newHighlightedNodes = getNodesInRange(
          newNodes,
          simpleRanges.viewRange
        );

        const highlightedRange = simpleRanges.charRange;
        const viewRange = simpleRanges.viewRange;

        this.setState({
          highlightedNodes: newHighlightedNodes,
          highlightedRange: highlightedRange,
          viewRange: viewRange,
          textIsHighlighted: true,
          offsetTop: this.getScrollTop(simpleRanges.charRange),
        });

        if (this.props.setFactHandlers) {
          this.props.setFactHandlers.handleRangeSet(
            highlightedRange,
            viewRange
          );
        }
      }
    }
  };
  handleVideoRangeSet = (videoRange: [number, number]) => {
    if (this.props.setFactHandlers) {
      this.props.setFactHandlers.handleRangeSet(videoRange);
    }
    this.setState({
      textIsHighlighted: true,
    });
  };
  handleSetClick = (videoRange?: [number, number]) => {
    let factHash = this.props.factLink.hash;
    if (videoRange) {
      if (this.props.setFactHandlers) {
        this.props.setFactHandlers.handleVideoSetClick(factHash, videoRange);
      } else {
        // User is reading a Take with a video in it and clicked "Send to take"
        window.location.href =
          Routes.DRAFTS_NEW +
          "/#" +
          factHash +
          "&" +
          videoRange[0] +
          "&" +
          videoRange[1];
      }
    } else {
      let highlightedRange = this.state.highlightedRange;
      let viewRange = this.state.viewRange;
      if (this.props.setFactHandlers) {
        this.props.setFactHandlers.handleDocumentSetClick(
          factHash,
          highlightedRange,
          viewRange
        );
      } else {
        window.location.href =
          Routes.DRAFTS_NEW +
          "/#" +
          factHash +
          "&" +
          highlightedRange[0] +
          "&" +
          highlightedRange[1] +
          "&" +
          viewRange[0] +
          "&" +
          viewRange[1];
      }
    }
  };
  componentDidMount() {
    this.setup();
  }
  setup = (nextProps?: TimelinePreviewProps) => {
    let props;
    if (nextProps) {
      props = nextProps;
    } else {
      props = this.props;
    }

    if (props.ranges && props.ranges.viewRange && this.props.nodes) {
      // Get the list of nodes highlighted by a previous author
      let initialHighlightedNodes = getHighlightedNodes(
        this.props.nodes,
        props.ranges.highlightedRange,
        props.ranges.viewRange
      );

      // Get the scrollTop value of the top most HTML element containing the same highlighted nodes
      let offsetTop;
      if (nextProps && nextProps.ranges) {
        offsetTop = this.getScrollTop(nextProps.ranges.highlightedRange);
      } else {
        offsetTop = this.getScrollTop();
      }

      // Scroll the Document to this offset
      let scrollTop = offsetTop + FactHeader.headerHeight;
      if (props.offset) {
        scrollTop -= props.offset;
      }

      window.scrollTo(0, scrollTop);

      this.setState({
        highlightedNodes: initialHighlightedNodes,
        highlightedRange: props.ranges ? props.ranges.highlightedRange : [0, 0],
        offsetTop: offsetTop,
        textIsHighlighted: true,
        viewRange:
          props.ranges && props.ranges.viewRange
            ? props.ranges.viewRange
            : [0, 0],
      });
    }
  };
  componentWillReceiveProps(nextProps: TimelinePreviewProps) {
    if (this.props.factLink.fact.title !== nextProps.factLink.fact.title) {
      this.setState({
        textIsHighlighted: false,
        highlightedNodes: [],
      });
    } else if (!nextProps.ranges) {
      this.setState({
        textIsHighlighted: false,
        highlightedNodes: [],
        highlightedRange: [0, 0],
        viewRange: [0, 0],
      });
    } else if (!isEqual(this.props.ranges, nextProps.ranges)) {
      this.setup(nextProps);
    }
  }
  render() {
    const documentEventHandlers: DocumentEventHandlers = {
      onMouseUp: this.handleMouseUp,
    };
    if (this.props.factLink.fact.kind === "document") {
      return (
        <div className={"timeline__preview"}>
          <StickyFactHeader
            heading={this.props.factLink.fact.title}
            onClearClick={this.handleClearClick}
            textIsHighlighted={this.state.textIsHighlighted}
            isDocument={
              this.props.factLink.fact.kind === "document" ? true : false
            }
          />
          {this.props.nodes ? (
            <Document
              nodes={this.props.nodes}
              eventHandlers={documentEventHandlers}
              ref={(document) => (this.document = document)}
              className={"document__row"}
            >
              {this.state.textIsHighlighted ? (
                <div
                  className="editor__block editor__block--overlay"
                  style={{ top: this.state.offsetTop }}
                  onClick={() => this.handleSetClick()}
                >
                  <DocumentTextNodeList
                    className="editor__document editor__document--hover"
                    documentNodes={this.state.highlightedNodes}
                  />
                </div>
              ) : null}
            </Document>
          ) : null}
        </div>
      );
    } else {
      return (
        <div className={"timeline__preview"}>
          <FactHeader heading={this.props.factLink.fact.title} />
          {this.props.videoFact ? (
            <Video
              onSetClick={this.handleSetClick}
              onRangeSet={this.handleVideoRangeSet}
              onClearClick={this.handleClearClick}
              videoFact={this.props.videoFact}
              videoFactHash={this.props.factLink.hash}
              clipRange={
                this.props.ranges && !this.props.ranges.viewRange
                  ? this.props.ranges.highlightedRange
                  : null
              }
              className={"video__inner-container"}
            />
          ) : null}
        </div>
      );
    }
  }
}
