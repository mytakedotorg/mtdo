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
import { FT } from "../java2ts/FT";
import { Routes } from "../java2ts/Routes";
import { slugify } from "../common/functions";
import BlockEditor, { TakeDocument } from "./BlockEditor";
import ReactionContainer from "./ReactionContainer";

interface BlockReaderProps {
  initState: TakeDocument;
  takeId: number;
}

interface BlockReaderState {
  takeDocument: TakeDocument;
}

class BlockReader extends React.Component<BlockReaderProps, BlockReaderState> {
  constructor(props: BlockReaderProps) {
    super(props);

    this.state = {
      takeDocument: props.initState,
    };
  }
  handleClick = (
    factLink: FT.FactLink,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ) => {
    const { title } = factLink.fact;
    window.location.href =
      Routes.FOUNDATION_V1 +
      "/" +
      slugify(title) +
      "/" +
      highlightedRange[0] +
      "-" +
      highlightedRange[1] +
      "/" +
      viewRange[0] +
      "-" +
      viewRange[1];
  };
  render() {
    const eventHandlers = {
      onDocumentClick: this.handleClick,
    };
    return (
      <div>
        <BlockEditor
          takeDocument={(Object as any).assign({}, this.state.takeDocument)}
          eventHandlers={eventHandlers}
        />
        <ReactionContainer
          takeId={this.props.takeId}
          takeDocument={(Object as any).assign({}, this.state.takeDocument)}
        />
      </div>
    );
  }
}

export default BlockReader;
