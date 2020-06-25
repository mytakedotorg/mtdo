/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
import BlockEditor, { TakeBlock, TakeDocument } from "./BlockEditor";
import { alertErr, slugify } from "../utils/functions";
import { Share } from "../java2ts/Share";
import { Routes } from "../java2ts/Routes";

interface AnonymousTakeProps {
  path: string;
}

interface AnonymousTakeState {
  take?: Share.ShareReq;
}

class AnonymousTake extends React.Component<
  AnonymousTakeProps,
  AnonymousTakeState
> {
  constructor(props: AnonymousTakeProps) {
    super(props);

    this.state = {};
  }
  buildTakeDocument = (takeObject: Share.ShareReq): TakeDocument => {
    const highlightedRange: [number, number] = [
      parseFloat(takeObject.hStart),
      parseFloat(takeObject.hEnd),
    ];
    let block: TakeBlock;
    if (takeObject.vidId) {
      block = {
        kind: "video",
        videoId: takeObject.vidId,
        range: highlightedRange,
      };
    } else if (
      takeObject.docId &&
      takeObject.vStart != null &&
      takeObject.vEnd != null
    ) {
      const viewRange: [number, number] = [
        parseFloat(takeObject.vStart),
        parseFloat(takeObject.vEnd),
      ];
      block = {
        kind: "document",
        excerptId: takeObject.docId,
        highlightedRange: highlightedRange,
        viewRange: viewRange,
      };
    } else {
      const msg = "AnonymousTake: Error decoding fact block";
      alertErr(msg);
      throw msg;
    }
    const takeDocument: TakeDocument = {
      title: takeObject.title,
      blocks: [block],
    };
    return takeDocument;
  };
  parseUrl = () => {
    const pathArr = this.props.path.split("/");
    if (pathArr.length !== 5) {
      const msg = "AnonymousTake: Invalid path length";
      alertErr(msg);
      throw msg;
    }
    const slugifiedTitle = pathArr[2];
    const foundationVersion = pathArr[3];
    const base64Str = pathArr[4];
    const decodedTakeObject: Share.ShareReq = JSON.parse(atob(base64Str));
    if (slugify(decodedTakeObject.title) !== slugifiedTitle) {
      const msg = "AnonymousTake: Error decoding base64. Titles do not match";
      alertErr(msg);
      throw msg;
    }
    this.setState({ take: decodedTakeObject });
  };
  componentDidMount() {
    this.parseUrl();
  }
  render() {
    const eventHandlers = {
      onDocumentClick: () => {},
    };
    return (
      <div className="anonymoustake">
        {this.state.take ? (
          <div>
            <BlockEditor
              takeDocument={this.buildTakeDocument(this.state.take)}
              eventHandlers={eventHandlers}
            />
            <p className="anonymoustake__text">
              This take was made by someone without a MyTake.org account.{" "}
              <a className="anonymoustake__link" href={Routes.LOGIN}>
                Create an account
              </a>{" "}
              to get access to powerful authoring tools as well as the ability
              to track the number of likes and views for your own takes.
            </p>
          </div>
        ) : (
          <p>Parsing URL</p>
        )}
      </div>
    );
  }
}

export default AnonymousTake;
