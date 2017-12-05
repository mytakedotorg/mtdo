import * as React from "react";
import * as keycode from "keycode";
import DocumentTextNodeList from "../../DocumentTextNodeList";
import { getHighlightedNodes, FoundationNode } from "../../../utils/functions";
import { fetchFact } from "../../../utils/databaseAPI";
import { DocumentBlock } from "../../../java2ts/DocumentBlock";
import { Foundation } from "../../../java2ts/Foundation";
import { isWriteOnly, ReadingEventHandlers, WritingEventHandlers } from "../";

interface EditorDocumentContainerProps {
  idx: number;
  active: boolean;
  block: DocumentBlock;
  eventHandlers: WritingEventHandlers | ReadingEventHandlers;
}

interface EditorDocumentContainerState {
  loading: boolean;
  error: boolean;
  document?: {
    fact: Foundation.Fact;
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
      error: false
    };
  }
  getFact = (factHash: string) => {
    fetchFact(
      factHash,
      (
        error: string | Error | null,
        factContent: Foundation.DocumentFactContent
      ) => {
        if (error) {
          this.setState({
            error: true
          });
        } else {
          let nodes: FoundationNode[] = [];

          for (let documentComponent of factContent.components) {
            nodes.push({
              component: documentComponent.component,
              innerHTML: [documentComponent.innerHTML],
              offset: documentComponent.offset
            });
          }

          this.setState({
            loading: false,
            document: {
              fact: factContent.fact,
              nodes: nodes
            }
          });
        }
      }
    );
  };
  handleRetryClick = () => {
    this.setState({
      error: false
    });
    this.getFact(this.props.block.excerptId);
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
      <div>
        {this.state.error
          ? <DocumentErrorView onRetryClick={this.handleRetryClick} />
          : this.state.loading || !this.state.document
            ? <DocumentLoadingView />
            : <Document {...this.props} document={this.state.document} />}
      </div>
    );
  }
}

const DocumentLoadingView: React.StatelessComponent<{}> = props =>
  <div className="editor__document editor__document--base editor__document--hover">
    <h2 className="editor__document-title">Loading</h2>
  </div>;

interface DocumentErrorViewProps {
  onRetryClick: () => any;
}

const DocumentErrorView: React.StatelessComponent<
  DocumentErrorViewProps
> = props =>
  <div className="editor__document editor__document--base editor__document--hover">
    <h2 className="editor__document-title">
      Error loading Foundation Document
    </h2>
    <button
      className="editor__button editor__button--reload"
      onClick={props.onRetryClick}
    >
      retry?
    </button>
  </div>;

interface DocumentProps {
  idx: number;
  active: boolean;
  block: DocumentBlock;
  document: {
    fact: Foundation.Fact;
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
      const factlink: Foundation.FactLink = {
        fact: this.props.document.fact,
        hash: this.props.block.excerptId
      };
      this.props.eventHandlers.onDocumentClick(
        factlink,
        this.div.getBoundingClientRect().top,
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
