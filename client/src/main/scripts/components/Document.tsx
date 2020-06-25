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
import DocumentTextNodeList from "./DocumentTextNodeList";

export interface DocumentEventHandlers {
  onMouseUp: () => any;
}

interface DocumentProps {
  eventHandlers: DocumentEventHandlers;
  nodes: FoundationNode[];
  className?: string;
}

interface DocumentState {}

class Document extends React.Component<DocumentProps, DocumentState> {
  constructor(props: DocumentProps) {
    super(props);
  }
  getDocumentNodes = () => {
    return [...this.props.nodes];
  };
  render() {
    let classes = "document document--static";
    let documentClass = this.props.className
      ? this.props.className
      : "document__row";

    return (
      <div className={classes}>
        <div className={documentClass}>
          <div className={"document__row-inner"}>
            <DocumentTextNodeList
              className="document__text"
              onMouseUp={this.props.eventHandlers.onMouseUp}
              documentNodes={this.props.nodes}
            />
            {this.props.children ? this.props.children : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Document;
