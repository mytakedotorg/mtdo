import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditor, { TakeDocument } from "../BlockEditor";
import FoundationExplorer from "../FoundationExplorer";
import { FoundationTextType } from "../Foundation";

interface BlockReaderProps {
  initState?: TakeDocument;
}

interface BlockReaderState {
  takeDocument?: TakeDocument;
}

class BlockReader extends React.Component<BlockReaderProps, BlockReaderState> {
  constructor(props: BlockReaderProps) {
    super(props);

    this.state = {
      takeDocument: props.initState
    };
  }
  handleClick = (
    type: FoundationTextType,
    blockIndex: number,
    offset: number
  ) => {
    window.location.href =
      "/foundation/" +
      type.toLowerCase() +
      "#" +
      window.location.pathname +
      "&" +
      blockIndex +
      "&" +
      offset;
  };
  render() {
    return (
      <div>
        <BlockEditor
          takeDocument={(Object as any).assign({}, this.state.takeDocument)}
          readOnly={true}
          onDocumentClick={this.handleClick}
        />
      </div>
    );
  }
}

export default BlockReader;
