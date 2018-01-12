import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditor, { TakeDocument } from "./BlockEditor";
import ReactionContainer from "./ReactionContainer";
import { slugify } from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";

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
      onDocumentClick: this.handleClick
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
