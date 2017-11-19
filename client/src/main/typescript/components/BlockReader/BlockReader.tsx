import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditor from "../BlockEditor";
import { TakeDocument, DraftRev, DraftPost } from "../../server/api";

interface BlockReaderProps {
  initState: TakeDocument;
}

interface BlockReaderState {
  takeDocument: TakeDocument;
  parentRev?: DraftRev;
}

class BlockReader extends React.Component<BlockReaderProps, BlockReaderState> {
  constructor(props: BlockReaderProps) {
    super(props);

    this.state = {
      takeDocument: props.initState
    };
  }
  handleClick = (
    excerptId: string,
    offset: number,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ) => {
    window.location.href =
      "/foundation/" +
      excerptId +
      "#" +
      window.location.pathname +
      "&" +
      highlightedRange[0] +
      "&" +
      highlightedRange[1] +
      "&" +
      viewRange[0] +
      "&" +
      viewRange[1] +
      "&" +
      offset;
  };
  handleSaveClick = () => {
    const headers = new Headers();

    headers.append("Accept", "application/json"); // This one is enough for GET requests
    headers.append("Content-Type", "application/json"); // This one sends body

    //TODO: enforce title length <= 255
    const bodyJson: DraftPost = {
      parentRev: this.state.parentRev,
      title: this.state.takeDocument.title,
      blocks: this.state.takeDocument.blocks
    };
    const request: RequestInit = {
      method: "POST",
      credentials: "include",
      headers: headers,
      body: JSON.stringify(bodyJson)
    };

    fetch("/drafts/save", request)
      .then(function(response) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") >= 0) {
          return response.json();
        }
        throw new TypeError("Oops, we haven't got JSON!");
      })
      .then(function(json) {
        const response: DraftRev = json;
        this.setState({
          parentRev: response
        });
      })
      .catch(function(error) {
        throw error;
      });
  };
  render() {
    const eventHandlers = {
      onDocumentClick: this.handleClick
    };
    return (
      <div>
        <button
          className="editor__button video__button--save"
          onClick={this.handleSaveClick}
        >
          Save
        </button>
        <BlockEditor
          takeDocument={(Object as any).assign({}, this.state.takeDocument)}
          eventHandlers={eventHandlers}
        />
      </div>
    );
  }
}

export default BlockReader;
