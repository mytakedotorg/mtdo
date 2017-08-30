import * as React from "react";
import * as keycode from "keycode";
import YouTube from "react-youtube";
import {
  FoundationNode,
  FoundationNodeProps,
  FoundationTextType
} from "../Foundation";
import { getNodeArray, getHighlightedNodes } from "../../utils/functions";

interface YTPlayerParameters {
  rel: number;
  start?: number;
  end?: number;
}

////////////////////
// Document model //
////////////////////
export interface ParagraphBlock {
  kind: "paragraph";
  text: string;
}
export interface DocumentBlock {
  kind: "document";
  document: FoundationTextType;
  range: [number, number];
}
export interface VideoBlock {
  kind: "video";
  videoId: string;
  range?: [number, number];
}
export interface WritingEventHandlers {
  handleDelete: (idx: number) => void | undefined;
  handleEnterPress: () => void | undefined;
  handleFocus: (idx: number) => void | undefined;
  handleChange?: (idx: number, value: string) => void;
}
interface ParagraphBlockReadWriteProps {
  writingEventHandlers: WritingEventHandlers;
}
export interface ParagraphBlockProps {
  idx: number;
  active: boolean;
  block: ParagraphBlock;
  readWrite?: ParagraphBlockReadWriteProps;
}
export interface ParagraphBlockState {
  style: any;
}
interface DocumentBlockReadOnlyProps {
  onDocumentClick: (
    type: FoundationTextType,
    idx: number,
    offset: number
  ) => void;
}
export interface DocumentBlockProps {
  idx: number;
  active: boolean;
  block: DocumentBlock;
  writingEventHandlers?: WritingEventHandlers;
  readOnly?: DocumentBlockReadOnlyProps;
}
export interface DocumentBlockState {
  documentNodes: FoundationNode[];
}
export interface VideoBlockProps {
  idx: number;
  active: boolean;
  block: VideoBlock;
  writingEventHandlers?: WritingEventHandlers;
}
export interface VideoBlockState {}

export type TakeBlock = ParagraphBlock | DocumentBlock | VideoBlock;

export interface TakeDocument {
  title: string;
  blocks: TakeBlock[];
}

/////////////////
// React model //
/////////////////
class Paragraph extends React.Component<
  ParagraphBlockProps,
  ParagraphBlockState
> {
  private textarea: HTMLTextAreaElement;
  private div: HTMLDivElement;
  constructor(props: ParagraphBlockProps) {
    super(props);

    this.state = {
      style: {}
    };
  }
  handleBlur = () => {
    if (this.props.readWrite && !this.props.block.text) {
      // Paragraph is about to lose focus. If empty, should be removed.
      this.props.readWrite.writingEventHandlers.handleDelete(this.props.idx);
    }
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch (ev.keyCode) {
      case keycode("enter"):
        ev.preventDefault();
        if (this.props.readWrite) {
          this.props.readWrite.writingEventHandlers.handleEnterPress();
        }
        break;
      case keycode("backspace") || keycode("delete"):
        if (this.props.readWrite && !this.props.block.text) {
          this.props.readWrite.writingEventHandlers.handleDelete(
            this.props.idx
          );
        }
        break;
      default:
        break;
    }
  };
  handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (
      this.props.readWrite &&
      this.props.readWrite.writingEventHandlers.handleChange
    ) {
      this.props.readWrite.writingEventHandlers.handleChange(
        this.props.idx,
        ev.target.value
      );
    }
  };
  handleClick = () => {
    if (this.props.readWrite) {
      this.props.readWrite.writingEventHandlers.handleFocus(this.props.idx);
    }
  };
  handleFocus = () => {
    if (this.props.readWrite) {
      this.props.readWrite.writingEventHandlers.handleFocus(this.props.idx);
    }
  };
  handleKeyUp = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    this.resetHeight();
  };
  resetHeight = () => {
    let content: string = this.props.block.text;
    content = content.replace(/\n/g, "<br />");
    this.div.innerHTML = content + "<br />";
    let height = this.div.clientHeight;
    this.setState({
      style: { height: height }
    });
  };
  componentDidMount() {
    this.resetHeight();
    if (this.props.active) {
      this.textarea.focus();
    }
  }
  componentDidUpdate() {
    if (this.props.active) {
      this.textarea.focus();
    }
  }
  componentWillReceiveProps(nextProps: ParagraphBlockProps) {
    if (this.props.block.text !== nextProps.block.text) {
      this.resetHeight();
    }
  }
  render() {
    let classes = "editor__paragraph";
    if (this.props.active) {
      classes += " editor__paragraph--active";
    }
    return (
      <div>
        <textarea
          className={classes}
          onBlur={this.handleBlur}
          onChange={this.handleChange}
          onClick={this.handleClick}
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyDown}
          onKeyUp={this.handleKeyUp}
          placeholder={this.props.idx === 0 ? "Use your voice here." : "..."}
          value={this.props.block.text}
          style={this.state.style}
          readOnly={this.props.readWrite ? false : true}
          ref={(textarea: HTMLTextAreaElement) => (this.textarea = textarea)}
        />
        <div
          className="editor__paragraph-height-div"
          ref={(div: HTMLDivElement) => (this.div = div)}
        />
      </div>
    );
  }
}

class Document extends React.Component<DocumentBlockProps, DocumentBlockState> {
  private div: HTMLDivElement;
  constructor(props: DocumentBlockProps) {
    super(props);

    this.state = {
      documentNodes: getNodeArray(props.block.document)
    };
  }
  handleClick = () => {
    if (this.props.writingEventHandlers) {
      this.props.writingEventHandlers.handleFocus(this.props.idx);
    }
    if (this.props.readOnly) {
      this.props.readOnly.onDocumentClick(
        this.props.block.document,
        this.props.idx,
        this.div.getBoundingClientRect().top
      );
    }
  };
  handleFocus = () => {
    if (this.props.writingEventHandlers) {
      this.props.writingEventHandlers.handleFocus(this.props.idx);
    }
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    switch (ev.keyCode) {
      case keycode("enter"):
        if (this.props.writingEventHandlers) {
          this.props.writingEventHandlers.handleEnterPress();
        }
        break;
      case keycode("backspace") || keycode("delete"):
        if (this.props.writingEventHandlers) {
          this.props.writingEventHandlers.handleDelete(this.props.idx);
        }
        break;
      default:
        break;
    }
  };
  render() {
    const { props } = this;
    let highlightedNodes = getHighlightedNodes(
      [...this.state.documentNodes],
      props.block.range
    );

    let classes = "editor__document editor__document--base";
    if (this.props.active) {
      classes += " editor__document--active";
    }
    return (
      <div
        tabIndex={0}
        className={classes}
        onClick={this.handleClick}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
        ref={(div: HTMLDivElement) => (this.div = div)}
      >
        {highlightedNodes.map((node, index) => {
          node.props["key"] = index.toString();
          return React.createElement(
            node.component,
            node.props,
            node.innerHTML
          );
        })}
      </div>
    );
  }
}

class Video extends React.Component<VideoBlockProps, VideoBlockState> {
  constructor(props: VideoBlockProps) {
    super(props);
  }
  handleClick = () => {
    if (this.props.writingEventHandlers) {
      this.props.writingEventHandlers.handleFocus(this.props.idx);
    }
  };
  handleFocus = () => {
    if (this.props.writingEventHandlers) {
      this.props.writingEventHandlers.handleFocus(this.props.idx);
    }
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    switch (ev.keyCode) {
      case keycode("enter"):
        if (this.props.writingEventHandlers) {
          this.props.writingEventHandlers.handleEnterPress();
        }
        break;
      case keycode("backspace") || keycode("delete"):
        if (this.props.writingEventHandlers) {
          this.props.writingEventHandlers.handleDelete(this.props.idx);
        }
        break;
      default:
        break;
    }
  };
  handleVideoEnd = (event: any) => {
    event.target.stopVideo();
  };
  render() {
    const { props } = this;

    let classes = "editor__video-container";
    if (this.props.active) {
      classes += " editor__video-container--active";
    }

    let playerVars: YTPlayerParameters = {
      rel: 0
    };

    if (props.block.range) {
      playerVars.start = props.block.range[0];
      playerVars.end = props.block.range[1];
    }

    const opts = {
      height: "315",
      width: "560",
      playerVars: playerVars
    };

    return (
      <div
        tabIndex={0}
        className={classes}
        onClick={this.handleClick}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
      >
        <YouTube
          videoId={props.block.videoId}
          opts={opts}
          onEnd={this.handleVideoEnd}
          className="editor__video"
        />
      </div>
    );
  }
}

export interface BlockContainerProps {
  block: TakeBlock;
  index: number;
  writingEventHandlers?: WritingEventHandlers;
  onDocumentClick?: (
    type: FoundationTextType,
    idx: number,
    offset: number
  ) => void;
  active: boolean;
}

class BlockContainer extends React.Component<BlockContainerProps, {}> {
  constructor(props: BlockContainerProps) {
    super(props);
  }
  render() {
    let inner;
    const { props } = this;
    switch (props.block.kind) {
      case "paragraph":
        if (props.writingEventHandlers) {
          const readWrite: ParagraphBlockReadWriteProps = {
            writingEventHandlers: props.writingEventHandlers
          };
          inner = (
            <Paragraph
              block={props.block}
              idx={props.index}
              active={props.active}
              readWrite={readWrite}
            />
          );
        } else {
          inner = (
            <Paragraph
              block={props.block}
              idx={props.index}
              active={props.active}
            />
          );
        }
        break;
      case "document":
        if (props.onDocumentClick) {
          const readOnly: DocumentBlockReadOnlyProps = {
            onDocumentClick: props.onDocumentClick
          };
          inner = (
            <Document
              block={props.block}
              idx={props.index}
              active={props.active}
              readOnly={readOnly}
            />
          );
        } else {
          inner = (
            <Document
              block={props.block}
              idx={props.index}
              active={props.active}
              writingEventHandlers={props.writingEventHandlers}
            />
          );
        }
        break;
      case "video":
        inner = (
          <Video
            block={props.block as VideoBlock}
            idx={props.index}
            active={props.active}
            writingEventHandlers={props.writingEventHandlers}
          />
        );
        break;
    }

    return (
      <div className="editor__block editor__block--base">
        {inner}
      </div>
    );
  }
}

interface BlockEditorReadWriteProps {
  handleChange: (idx: number, value: string, isTitle?: boolean) => void;
  handleDelete: (idx: number) => void;
  handleEnter: (isTitle?: boolean) => void;
  handleFocus: (idx: number) => void;
}
interface BlockEditorReadOnlyProps {
  onDocumentClick: (
    type: FoundationTextType,
    idx: number,
    offset: number
  ) => void;
}
export interface BlockEditorProps {
  takeDocument: TakeDocument;
  active?: number;
  readOnly?: BlockEditorReadOnlyProps;
  readWrite?: BlockEditorReadWriteProps;
}

export interface BlockEditorState {
  style: any;
}

class BlockEditor extends React.Component<BlockEditorProps, BlockEditorState> {
  private textarea: HTMLTextAreaElement;
  private div: HTMLDivElement;
  constructor(props: BlockEditorProps) {
    super(props);

    this.state = {
      style: {}
    };
  }
  handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (this.props.readWrite) {
      this.props.readWrite.handleChange(-1, ev.target.value);
    }
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (this.props.readWrite) {
      if (ev.keyCode === keycode("enter")) {
        ev.preventDefault();
        this.props.readWrite.handleEnter(true);
      }
    }
  };
  handleKeyUp = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    this.resetHeight();
  };
  resetHeight = () => {
    let content: string = this.props.takeDocument.title;
    content = content.replace(/\n/g, "<br />");
    this.div.innerHTML = content + "<br />";
    let height = this.div.clientHeight;
    this.setState({
      style: { height: height }
    });
  };
  componentDidMount() {
    this.resetHeight();
    if (this.props.active === -1) {
      this.textarea.focus();
    }
  }
  componentDidUpdate() {
    if (this.props.active === -1) {
      this.textarea.focus();
    }
  }
  render() {
    const { props } = this;
    return (
      <div className="editor__wrapper">
        <div className="editor">
          <div className="editor__inner">
            {props.readOnly
              ? <textarea
                  className="editor__title"
                  placeholder="Title"
                  value={props.takeDocument.title}
                  style={this.state.style}
                  readOnly={true}
                  ref={(textarea: HTMLTextAreaElement) =>
                    (this.textarea = textarea)}
                />
              : <textarea
                  className="editor__title"
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  onKeyUp={this.handleKeyUp}
                  placeholder="Title"
                  value={props.takeDocument.title}
                  style={this.state.style}
                  ref={(textarea: HTMLTextAreaElement) =>
                    (this.textarea = textarea)}
                />}
            <div
              className="editor__title-height-div"
              ref={(div: HTMLDivElement) => (this.div = div)}
            />
            <div className="editor__block-list">
              {props.takeDocument.blocks.map((block, idx) => {
                if (props.readOnly) {
                  return (
                    <BlockContainer
                      key={idx.toString()}
                      index={idx}
                      block={(Object as any).assign({}, block)}
                      onDocumentClick={props.readOnly.onDocumentClick}
                      active={idx === props.active}
                    />
                  );
                } else if (props.readWrite) {
                  const writingEventHandlers: WritingEventHandlers = {
                    handleChange: props.readWrite.handleChange,
                    handleDelete: props.readWrite.handleDelete,
                    handleEnterPress: props.readWrite.handleEnter,
                    handleFocus: props.readWrite.handleFocus
                  };
                  return (
                    <BlockContainer
                      key={idx.toString()}
                      index={idx}
                      block={(Object as any).assign({}, block)}
                      writingEventHandlers={writingEventHandlers}
                      active={idx === props.active}
                    />
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BlockEditor;
