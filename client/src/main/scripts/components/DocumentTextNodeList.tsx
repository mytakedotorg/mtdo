/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2019 MyTake.org, Inc.
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
import { FoundationNode } from "../common/CaptionNodes";
import DocumentTextNode from "./DocumentTextNode";

interface DocumentTextNodeListProps {
  className?: string;
  onMouseUp?: () => void;
  documentNodes: FoundationNode[];
}

interface DocumentTextNodeListState {}

class DocumentTextNodeList extends React.Component<
  DocumentTextNodeListProps,
  DocumentTextNodeListState
> {
  private scrollWindow: HTMLDivElement;
  constructor(props: DocumentTextNodeListProps) {
    super(props);
  }
  render() {
    return (
      <div
        className={this.props.className}
        onMouseUp={this.props.onMouseUp}
        ref={(scrollWindow: HTMLDivElement) =>
          (this.scrollWindow = scrollWindow)
        }
      >
        {this.props.documentNodes.map(function (
          element: FoundationNode,
          index: number
        ) {
          return (
            <DocumentTextNode key={index.toString()} documentNode={element} />
          );
        })}
      </div>
    );
  }
}

export default DocumentTextNodeList;
