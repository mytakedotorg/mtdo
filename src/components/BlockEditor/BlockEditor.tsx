import * as React from "react";
import * as keycode from "keycode";
import {
  FoundationNode,
  FoundationNodeProps,
  FoundationTextType
} from "../Foundation";
import { getNodeArray, getHighlightedNodes } from "../../utils/functions";

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
export interface EventHandlers {
  handleDelete: (idx: number) => void;
  handleEnterPress: () => void;
  handleFocus: (idx: number) => void;
}
export interface ParagraphBlockProps {
  idx: number;
  active: boolean;
  onChange: (idx: number, value: string) => void;
  block: ParagraphBlock;
  eventHandlers: EventHandlers;
}
export interface ParagraphBlockState {
  style: any;
}
export interface DocumentBlockProps {
  idx: number;
  active: boolean;
  block: DocumentBlock;
  eventHandlers: EventHandlers;
}
export interface DocumentBlockState {
  documentNodes: FoundationNode[];
}

export type TakeBlock = ParagraphBlock | DocumentBlock;

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
    // Paragraph is about to lose focus. If empty, should be removed.
    if (!this.props.block.text) {
      this.props.eventHandlers.handleDelete(this.props.idx);
    }
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch (ev.keyCode) {
      case keycode("enter"):
        ev.preventDefault();
        this.props.eventHandlers.handleEnterPress();
        break;
      case keycode("backspace") || keycode("delete"):
        if (!this.props.block.text) {
          this.props.eventHandlers.handleDelete(this.props.idx);
        }
        break;
      default:
        break;
    }
  };
  handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.onChange(this.props.idx, ev.target.value);
  };
  handleClick = () => {
    this.props.eventHandlers.handleFocus(this.props.idx);
  };
  handleFocus = () => {
    this.props.eventHandlers.handleFocus(this.props.idx);
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
	}
  componentDidMount() {
		if (this.props.active) {
			this.textarea.focus();
		}
	}
	componentDidUpdate(){
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
					placeholder={this.props.idx === 0 ? "Use your voice here." : "..." }
          value={this.props.block.text}
          style={this.state.style}
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
  constructor(props: DocumentBlockProps) {
    super(props);

    this.state = {
      documentNodes: getNodeArray(props.block.document),
    };
  }
  handleClick = () => {
    this.props.eventHandlers.handleFocus(this.props.idx);
  };
  handleFocus = () => {
    this.props.eventHandlers.handleFocus(this.props.idx);
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    switch (ev.keyCode) {
      case keycode("enter"):
        this.props.eventHandlers.handleEnterPress();
        break;
      case keycode("backspace") || keycode("delete"):
        this.props.eventHandlers.handleDelete(this.props.idx);
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
        
    let classes = "editor__document";
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

export interface BlockContainerProps {
  block: TakeBlock;
  index: number;
  handleDelete: (id: number) => void;
  handleChange: (id: number, value: string) => void;
  handleFocus: (id: number) => void;
  handleEnter: () => void;
  active: boolean;
}

class BlockContainer extends React.Component<BlockContainerProps, void> {
  constructor(props: BlockContainerProps) {
    super(props);
  }
  render() {
    let inner;
    const { props } = this;
    const eventHandlers: EventHandlers = {
      handleDelete: props.handleDelete,
      handleEnterPress: props.handleEnter,
      handleFocus: props.handleFocus
    };
    switch (props.block.kind) {
      case "paragraph":
        inner = (
          <Paragraph
            block={props.block}
            idx={props.index}
            active={props.active}
            onChange={props.handleChange}
            eventHandlers={eventHandlers}
          />
        );
        break;
      case "document":
        inner = (
          <Document
            block={props.block}
            idx={props.index}
            active={props.active}
            eventHandlers={eventHandlers}
          />
        );
        break;
    }

    return (
      <div className="editor__block">
        {inner}
      </div>
    );
  }
}

export interface BlockEditorProps {
  handleChange: (idx: number, value: string, isTitle?: boolean) => void;
  handleDelete: (idx: number) => void;
  handleEnter: (isTitle?: boolean) => void;
  handleFocus: (idx: number) => void;
  takeDocument: TakeDocument;
  active: number;
}

export interface BlockEditorState {
  style: any;
}

class BlockEditor extends React.Component<BlockEditorProps, BlockEditorState> {
  private div: HTMLDivElement;
  constructor(props: BlockEditorProps) {
    super(props);

    this.state = {
      style: {}
    };
  }
  handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.props.handleChange(0, ev.target.value, true);
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (ev.keyCode === keycode("enter")) {
      ev.preventDefault();
      this.props.handleEnter(true);
    }
  };
  handleKeyUp = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    let content: string = this.props.takeDocument.title;
    content = content.replace(/\n/g, "<br />");
    this.div.innerHTML = content + "<br />";
    this.setState({
      style: { height: this.div.clientHeight }
    });
  };
  render() {
    const { props } = this;
    return (
      <div className="editor__wrapper">
        <div className="editor">
          <div className="editor__inner">
            <textarea
              className="editor__title"
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
              onKeyUp={this.handleKeyUp}
							placeholder="Title"
              value={props.takeDocument.title}
              style={this.state.style}
            />
            <div
              className="editor__title-height-div"
              ref={(div: HTMLDivElement) => (this.div = div)}
            />
            <div className="editor__block-list">
              {props.takeDocument.blocks.map((block, idx) =>
                <BlockContainer
                  key={idx.toString()}
                  index={idx}
                  block={(Object as any).assign({}, block)}
                  handleDelete={props.handleDelete}
                  handleChange={props.handleChange}
                  handleFocus={props.handleFocus}
                  handleEnter={props.handleEnter}
                  active={idx === props.active}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BlockEditor;
