import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditor, { TakeDocument } from "../BlockEditor";
import FoundationExplorer from "../FoundationExplorer";
import { FoundationTextType } from "../Foundation";

interface BlockReaderProps {
  initState?: TakeDocument;
}

interface BlockReaderState {
  takeDocument: TakeDocument;
  expandedBlockType: any;
  expandedBlockRange: any;
  expandedBlockWindowOffset: any;
}

class BlockReader extends React.Component<BlockReaderProps, BlockReaderState> {
  constructor(props: BlockReaderProps) {
    super(props);

    this.state = {
      takeDocument: props.initState,
      expandedBlockType: null,
      expandedBlockRange: null,
      expandedBlockWindowOffset: null
    };
  }
  handleClick = (
    type: FoundationTextType,
    range: [number, number],
    offset: number
  ) => {
    this.setState({
      expandedBlockType: type,
      expandedBlockRange: range,
      expandedBlockWindowOffset: offset
    });
  };
  handleBackClick = () => {
    this.setState({
      expandedBlockType: null,
      expandedBlockRange: null,
      expandedBlockWindowOffset: null
    });
  };
  render() {
    return (
      <div>
        <BlockEditor
          takeDocument={(Object as any).assign({}, this.state.takeDocument)}
          readOnly={true}
          onDocumentClick={this.handleClick}
        />
        {this.state.expandedBlockType
          ? <FoundationExplorer
              type={this.state.expandedBlockType}
              range={this.state.expandedBlockRange}
              offset={this.state.expandedBlockWindowOffset}
              onBackClick={this.handleBackClick}
            />
          : null}
      </div>
    );
  }
}

export default BlockReader;
