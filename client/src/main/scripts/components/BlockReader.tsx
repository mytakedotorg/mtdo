import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditor, { TakeDocument } from "./BlockEditor";
import ReactionContainer from "./ReactionContainer";
import ShareContainer from "./ShareContainer";
import { slugify } from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";

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
      takeDocument: props.initState
    };
  }
  handleClick = (
    factLink: Foundation.FactLink,
    offset: number,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ) => {
    const { title } = factLink.fact;
    window.location.href =
      "/foundation" +
      "#" +
      slugify(title) +
      "&(" +
      window.location.pathname +
      ")&" +
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
  render() {
    const eventHandlers = {
      onDocumentClick: this.handleClick
    };
    return (
      <div>
        <ShareContainer
          takeDocument={(Object as any).assign({}, this.state.takeDocument)}
        />
        <BlockEditor
          takeDocument={(Object as any).assign({}, this.state.takeDocument)}
          eventHandlers={eventHandlers}
        />
        <ReactionContainer takeId={this.props.takeId} />
      </div>
    );
  }
}

export default BlockReader;
