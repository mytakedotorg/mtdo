/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import keycode from "keycode";
import * as React from "react";
import { FoundationNode } from "../common/CaptionNodes";
import { FoundationFetcher } from "../common/foundation";
import { DocumentBlock } from "../java2ts/DocumentBlock";
import { FT } from "../java2ts/FT";
import { getHighlightedNodes } from "../utils/functions";
import {
  isWriteOnly,
  ReadingEventHandlers,
  WritingEventHandlers,
} from "./BlockEditor";
import DocumentTextNodeList from "./DocumentTextNodeList";

export interface EditorDocumentContainerProps {
  idx: number;
  active: boolean;
  block: DocumentBlock;
  eventHandlers: WritingEventHandlers | ReadingEventHandlers;
}

export interface EditorDocumentContainerState {
  loading: boolean;
  document?: {
    fact: FT.Fact;
    nodes: FoundationNode[];
  };
}

class EditorDocumentContainer extends React.Component<
  EditorDocumentContainerProps,
  EditorDocumentContainerState
> {
  constructor(props: EditorDocumentContainerProps) {
    super(props);

    this.state = {
      loading: true,
    };
  }
  getFact = async (factHash: string) => {
    const factContent = await FoundationFetcher.justOneDocument(factHash);
    const nodes: FoundationNode[] = factContent.components.map(
      (documentComponent) => {
        return {
          component: documentComponent.component,
          innerHTML: [documentComponent.innerHTML],
          offset: documentComponent.offset,
        };
      }
    );
    this.setState({
      loading: false,
      document: {
        fact: factContent.fact,
        nodes: nodes,
      },
    });
  };
  componentDidMount() {
    this.getFact(this.props.block.excerptId);
  }
  componentWillReceiveProps(nextProps: EditorDocumentContainerProps) {
    if (this.props.block.excerptId !== nextProps.block.excerptId) {
      this.getFact(nextProps.block.excerptId);
    }
  }
  render() {
    return (
      <EditorDocumentBranch
        containerProps={this.props}
        containerState={this.state}
      />
    );
  }
}

interface EditorDocumentBranchProps {
  containerProps: EditorDocumentContainerProps;
  containerState: EditorDocumentContainerState;
}

export const EditorDocumentBranch: React.StatelessComponent<EditorDocumentBranchProps> = (
  props
) => {
  if (props.containerState.loading || !props.containerState.document) {
    return <DocumentLoadingView />;
  } else {
    return (
      <Document
        {...props.containerProps}
        document={props.containerState.document}
      />
    );
  }
};

const DocumentLoadingView: React.StatelessComponent<{}> = (props) => (
  <div className="editor__document editor__document--base editor__document--hover">
    <h2 className="editor__document-title">Loading</h2>
  </div>
);

interface DocumentProps {
  idx: number;
  active: boolean;
  block: DocumentBlock;
  document: {
    fact: FT.Fact;
    nodes: FoundationNode[];
  };
  eventHandlers: WritingEventHandlers | ReadingEventHandlers;
}

interface DocumentState {}

class Document extends React.Component<DocumentProps, DocumentState> {
  private div: HTMLDivElement;
  constructor(props: DocumentProps) {
    super(props);
  }
  blocksAreEqual(b1: DocumentBlock, b2: DocumentBlock): boolean {
    if (b1.excerptId !== b2.excerptId) {
      return false;
    }
    if (b1.highlightedRange[0] !== b2.highlightedRange[0]) {
      return false;
    }
    if (b1.highlightedRange[1] !== b2.highlightedRange[1]) {
      return false;
    }
    return true;
  }
  handleClick = () => {
    if (isWriteOnly(this.props.eventHandlers)) {
      this.props.eventHandlers.handleFocus(this.props.idx);
    } else {
      const factlink: FT.FactLink = {
        fact: this.props.document.fact,
        hash: this.props.block.excerptId,
      };
      this.props.eventHandlers.onDocumentClick(
        factlink,
        this.props.block.highlightedRange,
        this.props.block.viewRange
      );
    }
  };
  handleFocus = () => {
    if (isWriteOnly(this.props.eventHandlers)) {
      this.props.eventHandlers.handleFocus(this.props.idx);
    }
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    switch (ev.keyCode) {
      case keycode("enter"):
        if (isWriteOnly(this.props.eventHandlers)) {
          this.props.eventHandlers.handleEnterPress();
        }
        break;
      case keycode("backspace") || keycode("delete"):
        if (isWriteOnly(this.props.eventHandlers)) {
          this.props.eventHandlers.handleDelete(this.props.idx);
        }
        break;
      default:
        break;
    }
  };
  shouldComponentUpdate(nextProps: DocumentProps, nextState: DocumentState) {
    if (!this.blocksAreEqual(this.props.block, nextProps.block)) {
      return true;
    } else {
      return false;
    }
  }
  render() {
    const { props } = this;
    let highlightedNodes = getHighlightedNodes(
      [...this.props.document.nodes],
      props.block.highlightedRange,
      props.block.viewRange
    );

    let classes = "editor__document editor__document--base";
    if (isWriteOnly(this.props.eventHandlers)) {
      classes += " editor__document--no-hover";
    }
    const innerContent = (
      <div>
        <h2 className="editor__document-title">
          {this.props.document.fact.title}
        </h2>
        <DocumentTextNodeList documentNodes={highlightedNodes} />
      </div>
    );

    if (isWriteOnly(this.props.eventHandlers)) {
      return (
        <div
          tabIndex={0}
          className="editor__document editor__document--base editor__document--focus"
          onClick={this.handleClick}
          onFocus={this.handleFocus}
          onKeyDown={this.handleKeyDown}
          ref={(div: HTMLDivElement) => (this.div = div)}
        >
          {innerContent}
        </div>
      );
    } else {
      return (
        <div
          className="editor__document editor__document--base editor__document--hover"
          onClick={this.handleClick}
          ref={(div: HTMLDivElement) => (this.div = div)}
        >
          {innerContent}
        </div>
      );
    }
  }
}

export default EditorDocumentContainer;
