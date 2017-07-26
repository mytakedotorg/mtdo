import * as React from "react";
import BlockEditor, {
  DocumentBlock,
  ParagraphBlock,
  TakeDocument
} from "../BlockEditor";
import Foundation, { FoundationTextType } from "../Foundation";

interface MyTakeProps {
  initState: MyTakeState;
}

interface MyTakeState {
  takeDocument: TakeDocument;
  activeBlockIndex: number;
}

class MyTake extends React.Component<MyTakeProps, MyTakeState> {
  constructor(props: MyTakeProps) {
    super(props);

    this.state = {
      ...props.initState
    };
  }
  addDocument = (type: FoundationTextType, range: [number, number]): void => {
    const blocks = this.state.takeDocument.blocks;
    let activeBlockIndex = this.state.activeBlockIndex;

    const newBlock: DocumentBlock = {
      kind: "document",
      document: type,
      range: range
    };

    const newBlocks = [
      ...blocks.slice(0, activeBlockIndex + 1),
      newBlock,
      ...blocks.slice(activeBlockIndex + 1)
    ];

    this.setState({
      takeDocument: {
        ...this.state.takeDocument,
        blocks: newBlocks
      },
      activeBlockIndex: ++activeBlockIndex
    });
  };
  addParagraph = (isTitle?: boolean): void => {
    const blocks = this.state.takeDocument.blocks;

    let activeBlockIndex = this.state.activeBlockIndex;
    let newIndex;

    const newBlock: ParagraphBlock = {
      kind: "paragraph",
      text: ""
    };

    let newBlocks = [];

    if (isTitle) {
      newBlocks = [newBlock, ...blocks.slice(0)];
      newIndex = 0;
    } else {
      newBlocks = [
        ...blocks.slice(0, activeBlockIndex + 1),
        newBlock,
        ...blocks.slice(activeBlockIndex + 1)
      ];
      newIndex = ++activeBlockIndex;
    }

    this.setState({
      takeDocument: {
        ...this.state.takeDocument,
        blocks: newBlocks
      },
      activeBlockIndex: newIndex
    });
  };
  removeParagraph = (idx: number): void => {
    const blocks = this.state.takeDocument.blocks;
    if (blocks.length > 1) {
      this.setState({
        takeDocument: {
          ...this.state.takeDocument,
          blocks: [...blocks.slice(0, idx), ...blocks.slice(idx + 1)]
        }
      });
    } else {
      if (blocks[0].kind === "document") {
        //User wants a fresh take, so give user an empty paragraph.
        this.setState({
          takeDocument: {
            ...this.state.takeDocument,
            blocks: [{ kind: "paragraph", text: "" }]
          }
        });
      }
    }
  };
  handleTakeBlockChange = (
    idx: number,
    value: string,
    isTitle?: boolean
  ): void => {
    if (isTitle) {
      // Change the title
      this.setState({
        takeDocument: {
          ...this.state.takeDocument,
          title: value
        }
      });
    } else {
      const blocks = this.state.takeDocument.blocks;

      const newBlock = blocks[idx] as ParagraphBlock;
      newBlock.text = value;

      const newBlocks = [
        ...blocks.slice(0, idx),
        newBlock,
        ...blocks.slice(idx + 1)
      ];

      this.setState({
        takeDocument: {
          ...this.state.takeDocument,
          blocks: newBlocks
        }
      });
    }
  };
  handleTakeBlockFocus = (idx: number): void => {
    this.setActive(idx);
  };
  setActive = (idx: number): void => {
    this.setState({
      activeBlockIndex: idx
    });
  };
  render() {
    return (
      <div>
        <BlockEditor
          handleDelete={this.removeParagraph}
          handleChange={this.handleTakeBlockChange}
          handleFocus={this.handleTakeBlockFocus}
          handleEnter={this.addParagraph}
          takeDocument={this.state.takeDocument}
          active={this.state.activeBlockIndex}
        />
        <Foundation handleSetClick={this.addDocument} />
      </div>
    );
  }
}

export default MyTake;
