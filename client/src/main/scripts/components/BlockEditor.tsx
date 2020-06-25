/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
import * as React from "react";
import * as keycode from "keycode";
import EditorDocumentContainer from "./EditorDocumentContainer";
import EditorVideoContainer from "./EditorVideoContainer";
import { Foundation } from "../java2ts/Foundation";
import { ParagraphBlock } from "../java2ts/ParagraphBlock";
import { DocumentBlock } from "../java2ts/DocumentBlock";
import { VideoBlock } from "../java2ts/VideoBlock";
export { ParagraphBlock, DocumentBlock, VideoBlock };
export type TakeBlock = ParagraphBlock | DocumentBlock | VideoBlock;
export interface TakeDocument {
  title: string;
  blocks: TakeBlock[];
}

/////////////////
// React model //
/////////////////
export interface WritingEventHandlers {
  handleDelete: (idx: number) => void;
  handleEnterPress: (isTitle?: boolean) => void;
  handleFocus: (idx: number) => void;
  handleChange?: (idx: number, value: string) => void;
}
interface ParagraphBlockProps {
  idx: number;
  active: boolean;
  block: ParagraphBlock;
  eventHandlers?: WritingEventHandlers;
}
interface ParagraphBlockState {
  style: any;
}
export interface ReadingEventHandlers {
  onDocumentClick: (
    fact: Foundation.FactLink,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ) => void;
}
export function isWriteOnly(
  eventHandlers: WritingEventHandlers | ReadingEventHandlers | undefined
): eventHandlers is WritingEventHandlers {
  if (eventHandlers) {
    return (eventHandlers as WritingEventHandlers).handleDelete !== undefined;
  } else {
    return false;
  }
}

class Paragraph extends React.Component<
  ParagraphBlockProps,
  ParagraphBlockState
> {
  private text: HTMLTextAreaElement | HTMLParagraphElement;
  private paragraph: HTMLParagraphElement;
  constructor(props: ParagraphBlockProps) {
    super(props);

    this.state = {
      style: {},
    };
  }
  handleBlur = () => {
    if (isWriteOnly(this.props.eventHandlers) && !this.props.block.text) {
      // Paragraph is about to lose focus. If empty, should be removed.
      this.props.eventHandlers.handleDelete(this.props.idx);
    }
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    switch (ev.keyCode) {
      case keycode("enter"):
        ev.preventDefault();
        if (isWriteOnly(this.props.eventHandlers)) {
          this.props.eventHandlers.handleEnterPress();
        }
        break;
      case keycode("backspace") || keycode("delete"):
        if (isWriteOnly(this.props.eventHandlers) && !this.props.block.text) {
          this.props.eventHandlers.handleDelete(this.props.idx);
        }
        break;
      default:
        break;
    }
  };
  handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (
      isWriteOnly(this.props.eventHandlers) &&
      this.props.eventHandlers.handleChange
    ) {
      this.props.eventHandlers.handleChange(this.props.idx, ev.target.value);
    }
  };
  handleClick = () => {
    if (isWriteOnly(this.props.eventHandlers)) {
      this.props.eventHandlers.handleFocus(this.props.idx);
    }
  };
  handleFocus = () => {
    if (isWriteOnly(this.props.eventHandlers)) {
      this.props.eventHandlers.handleFocus(this.props.idx);
    }
  };
  handleKeyUp = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    this.resetHeight();
  };
  resetHeight = () => {
    let content: string = this.props.block.text;
    content = content.replace(/\n/g, "<br />");
    this.paragraph.innerHTML = content + "<br />";
    let height = this.paragraph.clientHeight;
    this.setState({
      style: { height: height },
    });
  };
  componentDidMount() {
    this.resetHeight();
    if (this.props.active) {
      this.text.focus();
    }
  }
  componentDidUpdate() {
    if (this.props.active) {
      this.text.focus();
    }
  }
  componentWillReceiveProps(nextProps: ParagraphBlockProps) {
    if (this.props.block.text !== nextProps.block.text) {
      this.resetHeight();
    }
  }
  render() {
    let classes = "editor__paragraph";
    return (
      <div className="editor__text-container">
        {isWriteOnly(this.props.eventHandlers) ? (
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
            ref={(text: HTMLTextAreaElement) => (this.text = text)}
          />
        ) : (
          <p
            className={classes}
            style={this.state.style}
            ref={(text: HTMLParagraphElement) => (this.text = text)}
          >
            {this.props.block.text}
          </p>
        )}
        <div className="editor__paragraph-height-div">
          <p
            ref={(paragraph: HTMLParagraphElement) =>
              (this.paragraph = paragraph)
            }
          >
            <br />
          </p>
        </div>
      </div>
    );
  }
}

interface BlockContainerProps {
  block: TakeBlock;
  index: number;
  eventHandlers: WritingEventHandlers | ReadingEventHandlers;
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
        if (isWriteOnly(props.eventHandlers)) {
          inner = (
            <Paragraph
              block={props.block}
              idx={props.index}
              active={props.active}
              eventHandlers={props.eventHandlers}
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
        inner = (
          <EditorDocumentContainer
            block={props.block}
            idx={props.index}
            active={props.active}
            eventHandlers={props.eventHandlers}
          />
        );
        break;
      case "video":
        if (isWriteOnly(props.eventHandlers)) {
          inner = (
            <EditorVideoContainer
              block={props.block as VideoBlock}
              idx={props.index}
              active={props.active}
              eventHandlers={props.eventHandlers}
            />
          );
        } else {
          inner = (
            <EditorVideoContainer
              block={props.block as VideoBlock}
              idx={props.index}
              active={props.active}
            />
          );
        }
        break;
    }

    return <div className="editor__block editor__block--base">{inner}</div>;
  }
}

interface BlockEditorProps {
  takeDocument: TakeDocument;
  active?: number;
  eventHandlers: WritingEventHandlers | ReadingEventHandlers;
}

interface BlockEditorState {
  style: any;
}

class BlockEditor extends React.Component<BlockEditorProps, BlockEditorState> {
  private text: HTMLTextAreaElement | HTMLHeadingElement;
  private div: HTMLDivElement;
  constructor(props: BlockEditorProps) {
    super(props);

    this.state = {
      style: {},
    };
  }
  handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (
      isWriteOnly(this.props.eventHandlers) &&
      this.props.eventHandlers.handleChange
    ) {
      this.props.eventHandlers.handleChange(-1, ev.target.value);
    }
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isWriteOnly(this.props.eventHandlers)) {
      if (ev.keyCode === keycode("enter")) {
        ev.preventDefault();
        this.props.eventHandlers.handleEnterPress(true);
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
      style: { height: height },
    });
  };
  componentDidMount() {
    this.resetHeight();
    if (this.props.active === -1) {
      this.text.focus();
    }
  }
  componentDidUpdate() {
    if (this.props.active === -1) {
      this.text.focus();
    }
  }
  render() {
    const { props } = this;
    return (
      <div className="editor__wrapper">
        <div className="editor">
          <div className="editor__inner">
            <div className="editor__text-container">
              {!isWriteOnly(props.eventHandlers) ? (
                <h1
                  className="editor__title"
                  style={this.state.style}
                  ref={(text: HTMLHeadingElement) => (this.text = text)}
                >
                  {props.takeDocument.title}
                </h1>
              ) : (
                <textarea
                  className="editor__title"
                  onChange={this.handleChange}
                  onKeyDown={this.handleKeyDown}
                  onKeyUp={this.handleKeyUp}
                  placeholder="Title"
                  value={props.takeDocument.title}
                  style={this.state.style}
                  ref={(text: HTMLTextAreaElement) => (this.text = text)}
                  maxLength={255}
                />
              )}
              <div
                className="editor__title-height-div"
                ref={(div: HTMLDivElement) => (this.div = div)}
              />
            </div>
            <div className="editor__block-list">
              {props.takeDocument.blocks.map((block, idx) => {
                if (!isWriteOnly(props.eventHandlers)) {
                  const readingEventHandlers: ReadingEventHandlers = {
                    onDocumentClick: props.eventHandlers.onDocumentClick,
                  };
                  return (
                    <BlockContainer
                      key={idx.toString()}
                      index={idx}
                      block={(Object as any).assign({}, block)}
                      eventHandlers={readingEventHandlers}
                      active={idx === props.active}
                    />
                  );
                } else {
                  const writingEventHandlers: WritingEventHandlers = {
                    handleChange: props.eventHandlers.handleChange,
                    handleDelete: props.eventHandlers.handleDelete,
                    handleEnterPress: props.eventHandlers.handleEnterPress,
                    handleFocus: props.eventHandlers.handleFocus,
                  };
                  return (
                    <BlockContainer
                      key={idx.toString()}
                      index={idx}
                      block={(Object as any).assign({}, block)}
                      eventHandlers={writingEventHandlers}
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
