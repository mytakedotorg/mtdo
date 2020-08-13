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
import { CaptionNode, CaptionNodeArr } from "../common/CaptionNodes";
import { FT } from "../java2ts/FT";
import CaptionTextNode from "./CaptionTextNode";
import isEqual = require("lodash/isEqual");

export interface CaptionTextNodeListEventHandlers {
  onMouseUp: () => any;
  onScroll: () => any;
}

interface CaptionTextNodeListProps {
  documentNodes: CaptionNodeArr;
  eventHandlers: CaptionTextNodeListEventHandlers;
  videoFact: FT.VideoFactContent;
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
          function (element: CaptionNode, index: number) {
            const fullName = this.props.videoFact.speakers[
              this.props.videoFact.turnSpeaker[index]
            ].fullName;

            return (
              <CaptionTextNode
                key={index}
                documentNode={element}
                speaker={fullName.substring(fullName.lastIndexOf(" ") + 1)}
              />
            );
          }.bind(this)
        )}
      </div>
    );
  }
}

export default CaptionTextNodeList;
