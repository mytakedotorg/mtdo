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
import { alertErr } from "../utils/functions";

interface DataAttributes {
  "data-char-offset": number;
}

interface DocumentTextNodeProps {
  documentNode: FoundationNode;
}

interface DocumentTextNodeState {}

class DocumentTextNode extends React.Component<
  DocumentTextNodeProps,
  DocumentTextNodeState
> {
  constructor(props: DocumentTextNodeProps) {
    super(props);
  }
  render() {
    const { documentNode } = this.props;

    let attributes: DataAttributes = {
      "data-char-offset": documentNode.offset,
    };

    switch (documentNode.component) {
      case "h2":
        return <h2 {...attributes}>{documentNode.innerHTML}</h2>;
      case "h3":
        return <h3 {...attributes}>{documentNode.innerHTML}</h3>;
      case "p":
        return <p {...attributes}>{documentNode.innerHTML}</p>;
      default:
        alertErr("DocumentTextNode: Unknown documentNode.component");
        throw "Unknown documentNode.component";
    }
  }
}

export default DocumentTextNode;
