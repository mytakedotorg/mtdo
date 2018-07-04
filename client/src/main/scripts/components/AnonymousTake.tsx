import * as React from "react";
import BlockEditor, { TakeBlock, TakeDocument } from "./BlockEditor";
import { alertErr, slugify } from "../utils/functions";
import { Share } from "../java2ts/Share";

interface AnonymousTakeProps {}

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
      parseInt(takeObject.highlightedRangeStart),
      parseInt(takeObject.highlightedRangeEnd)
    ];
    let block: TakeBlock;
    if (takeObject.videoId) {
      block = {
        kind: "video",
        videoId: takeObject.videoId,
        range: highlightedRange
      };
    } else {
      const msg = "AnonymousTake: Error decoding fact block";
      alertErr(msg);
      throw msg;
    }
    const takeDocument: TakeDocument = {
      title: takeObject.title,
      blocks: [block]
    };
    return takeDocument;
  };
  parseUrl = () => {
    const pathArr = window.location.pathname.split("/");
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
      onDocumentClick: () => {}
    };
    return (
      <div className="anonymoustake">
        {this.state.take ? (
          <BlockEditor
            takeDocument={this.buildTakeDocument(this.state.take)}
            eventHandlers={eventHandlers}
          />
        ) : (
          <p>Parsing URL</p>
        )}
      </div>
    );
  }
}

export default AnonymousTake;
