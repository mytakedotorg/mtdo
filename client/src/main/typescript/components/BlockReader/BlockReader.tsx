import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditor, { TakeDocument } from "../BlockEditor";

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
