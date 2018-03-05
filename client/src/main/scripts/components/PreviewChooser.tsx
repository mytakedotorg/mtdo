import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  Paragraph,
  ParagraphBlock,
  DocumentBlock,
  VideoBlock,
  TakeBlock,
  TakeDocument
} from "./BlockEditor";
import EditorDocumentContainer from "./EditorDocumentContainer";
import EditorVideoContainer from "./EditorVideoContainer";
import { FormEvent, ChangeEvent } from "react";
import { alertErr } from "../utils/functions";

interface PreviewChooserProps {
  takeDocument: TakeDocument;
  eventHandlers: {
    handleCancelClick: () => any;
    handlePublishClick: () => any;
  };
}

type FactBlock = DocumentBlock | VideoBlock;
type chooserStatus = "fact" | "text" | "confirm";

interface PreviewChooserState {
  factBlocks: FactBlock[];
  textBlocks: ParagraphBlock[];
  status: chooserStatus;
  factIdx: number;
  textIdx: number;
}

class PreviewChooser extends React.Component<
  PreviewChooserProps,
  PreviewChooserState
> {
  constructor(props: PreviewChooserProps) {
    super(props);

    const factBlocks: FactBlock[] = props.takeDocument.blocks.filter(block => {
      return block.kind === "document" || block.kind === "video";
    }) as FactBlock[];

    const textBlocks: ParagraphBlock[] = props.takeDocument.blocks.filter(
      block => {
        return block.kind === "paragraph" && block.text.length > 0;
      }
    ) as ParagraphBlock[];

    this.state = {
      factBlocks: factBlocks,
      textBlocks: textBlocks,
      status:
        factBlocks.length > 1
          ? "fact"
          : textBlocks.length > 1 ? "text" : "confirm",
      factIdx: factBlocks.length > 1 ? -1 : -1,
      textIdx: textBlocks.length > 1 ? -1 : -1
    };
  }
  handleBackClick = (idx?: number) => {
    switch (this.state.status) {
      case "confirm":
        if (
          this.state.textBlocks.length > 1 ||
          this.state.factBlocks.length > 1
        ) {
          this.setState({
            status: this.state.textBlocks.length > 1 ? "text" : "fact"
          });
        } else {
          this.props.eventHandlers.handleCancelClick();
        }
        break;
      case "text":
        if (idx) {
          if (this.state.factBlocks.length > 1) {
            this.setState({
              status: "fact",
              textIdx: idx
            });
          } else {
            this.props.eventHandlers.handleCancelClick();
          }
        } else {
          alertErr("PreviewChooser: expecting an index from BlockChooser");
          throw "PreviewChooser: expecting an index from BlockChooser";
        }
        break;
      case "fact":
        if (idx) {
          this.setState({
            factIdx: idx
          });
        } else {
          alertErr("PreviewChooser: expecting an index from BlockChooser");
          throw "PreviewChooser: expecting an index from BlockChooser";
        }
        this.props.eventHandlers.handleCancelClick();
        break;
    }
  };
  handleNextClick = (idx: number) => {
    switch (this.state.status) {
      case "fact":
        this.setState({
          status: this.state.textBlocks.length > -1 ? "text" : "confirm",
          factIdx: idx
        });
        break;
      case "text":
        this.setState({
          status: "confirm",
          textIdx: idx
        });
        break;
    }
  };
  handleConfirmClick = () => {
    this.props.eventHandlers.handlePublishClick();
  };
  handleCancelClick = () => {
    this.props.eventHandlers.handleCancelClick();
  };
  handleSelectionChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (this.state.status === "fact") {
      this.setState({
        factIdx: parseInt(event.target.value)
      });
    } else {
      this.setState({
        textIdx: parseInt(event.target.value)
      });
    }
  };
  render() {
    return (
      <div className="chooser">
        <div className="chooser__inner">
          <h1 className="chooser__heading">{this.props.takeDocument.title}</h1>
          {this.state.status === "confirm" ? (
            <ConfirmSelection
              factBlocks={this.state.factBlocks}
              textBlocks={this.state.textBlocks}
              factIdx={this.state.factIdx}
              textIdx={this.state.textIdx}
              handleBackClick={this.handleBackClick}
              handleConfirmClick={this.handleConfirmClick}
            />
          ) : (
            <BlockChooser
              blocks={
                this.state.status === "fact"
                  ? this.state.factBlocks
                  : this.state.textBlocks
              }
              handleNextClick={this.handleNextClick}
              handleBackClick={this.handleBackClick}
              handleChange={this.handleSelectionChange}
              status={this.state.status}
              selectedIdx={
                this.state.status === "fact"
                  ? this.state.factIdx
                  : this.state.textIdx
              }
            />
          )}
          <button onClick={this.handleCancelClick}>Cancel</button>
        </div>
      </div>
    );
  }
}

interface BlockChooserProps {
  blocks: TakeBlock[];
  handleNextClick: (idx: number) => any;
  handleBackClick: (idx: number) => any;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => any;
  status: chooserStatus;
  selectedIdx: number;
}

interface BlockChooserState {}

class BlockChooser extends React.Component<
  BlockChooserProps,
  BlockChooserState
> {
  constructor(props: BlockChooserProps) {
    super(props);
  }
  handleBackClick = () => {
    this.props.handleBackClick(this.props.selectedIdx);
  };
  handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    this.props.handleNextClick(this.props.selectedIdx);
  };
  handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    this.props.handleChange(event);
  };
  render() {
    const { blocks, status } = this.props;
    return (
      <div>
        <p className="chooser__instructions">
          Choose which {status} block you want to appear in previews of your
          Take.
        </p>
        <form onSubmit={this.handleSubmit}>
          {blocks.map((block, idx) => {
            const index = idx.toString();
            if (!(block.kind === "paragraph" && !block.text)) {
              return (
                <div>
                  <input
                    type="radio"
                    value={index}
                    id={"block" + index}
                    onChange={this.handleChange}
                    checked={this.props.selectedIdx === idx}
                  />
                  <label htmlFor={"block" + index}>
                    {block.kind === "document" ? (
                      <EditorDocumentContainer
                        block={block}
                        idx={0}
                        active={false}
                        eventHandlers={{
                          onDocumentClick: () => {
                            /* no-op */
                          }
                        }}
                      />
                    ) : block.kind === "video" ? (
                      <EditorVideoContainer
                        block={block}
                        idx={0}
                        active={false}
                      />
                    ) : (
                      <Paragraph block={block} idx={0} active={false} />
                    )}
                  </label>
                </div>
              );
            }
          })}

          <button type="submit">Next</button>
        </form>
        <button onClick={this.handleBackClick}>Back</button>
      </div>
    );
  }
}

interface ConfirmSelectionProps {
  factBlocks: FactBlock[];
  textBlocks: ParagraphBlock[];
  factIdx: number;
  textIdx: number;
  handleBackClick: () => any;
  handleConfirmClick: () => any;
}

const ConfirmSelection: React.StatelessComponent<
  ConfirmSelectionProps
> = props => {
  let blocks: TakeBlock[] = [];
  if (props.factIdx > -1) {
    blocks = [props.factBlocks[props.factIdx]];
  }
  if (props.textIdx > -1) {
    blocks = [...blocks, props.textBlocks[props.textIdx]];
  }
  console.log(blocks);
  return (
    <div>
      {blocks.map((block, idx) => {
        if (block) {
          switch (block.kind) {
            case "document":
              return (
                <EditorDocumentContainer
                  block={block}
                  idx={0}
                  active={false}
                  eventHandlers={{
                    onDocumentClick: () => {
                      /* no-op */
                    }
                  }}
                />
              );
            case "video":
              return (
                <EditorVideoContainer block={block} idx={0} active={false} />
              );
            case "paragraph":
              return <Paragraph block={block} idx={0} active={false} />;
          }
        }
      })}
      <button onClick={props.handleBackClick}>Back</button>
      <button onClick={props.handleConfirmClick}>Confirm</button>
    </div>
  );
};

export default PreviewChooser;
