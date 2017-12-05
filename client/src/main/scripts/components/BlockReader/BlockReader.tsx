import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditor, { TakeDocument } from "../BlockEditor";
import { slugify } from "../../utils/functions";
import { Foundation } from "../../java2ts/Foundation";

interface BlockReaderProps {
  initState: TakeDocument;
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
      "&" +
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
      </div>
    );
  }
}

export default BlockReader;
