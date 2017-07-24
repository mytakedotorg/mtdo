import * as React from "react";
import { FoundationNode } from "../Foundation";
const { Editor, Placeholder } = require("slate");

interface TakeEditorProps {
  editorState: SlateEditorState;
  schema: SlateSchema;
  onChange: (editorState: SlateEditorState) => void;
  onKeyDown: (
    event: KeyboardEvent,
    data: any,
    state: SlateEditorState
  ) => SlateEditorState;
}

// Define a React component renderer for each of our text blocks.
export function TitleNode(props: SlateProps): JSX.Element {
  return (
    <h1 className="editor__title" {...props.attributes}>
      <Placeholder
        parent={props.node}
        node={props.node}
        state={props.state}
        firstOnly={false}
        className="editor__title--placeholder"
      >
        <span>Title</span> {/*Title placeholder text*/}
      </Placeholder>
      {props.children}
    </h1>
  );
}

export function ParagraphNode(props: SlateProps): JSX.Element {
  return (
    <p className="editor__paragraph" {...props.attributes}>
      <Placeholder
        parent={props.node}
        node={props.node}
        state={props.state}
        firstOnly={false}
        className="editor__paragraph--placeholder"
      >
        <span>Use your voice here.</span> {/*Take placeholder text*/}
      </Placeholder>
      {props.children}
    </p>
  );
}

export function ConstitutionNode(props: SlateProps): JSX.Element {
  let nodes: Array<FoundationNode> = [];

  props.node.data.map(function(value: Array<FoundationNode>) {
    nodes = value;
  });

  return (
    <div className="editor__constitution" {...props.attributes}>
      {nodes.map(function(element: FoundationNode, index: number) {
        element.props["key"] = index.toString();
        return React.createElement(
          element.component,
          element.props,
          element.innerHTML
        );
      })}
      {props.children}
    </div>
  );
}

export function AmendmentsNode(props: SlateProps): JSX.Element {
  let nodes: Array<FoundationNode> = [];

  props.node.data.map(function(value: Array<FoundationNode>) {
    nodes = value;
  });

  return (
    <div className="editor__amendments" {...props.attributes}>
      {nodes.map(function(element: FoundationNode, index: number) {
        element.props["key"] = index.toString();
        return React.createElement(
          element.component,
          element.props,
          element.innerHTML
        );
      })}
      {props.children}
    </div>
  );
}

export default class TakeEditor extends React.Component<TakeEditorProps, void> {
  constructor(props: TakeEditorProps) {
    super(props);
  }

  render() {
    let { props } = this;
    return (
      <div className="editor__wrapper">
        <Editor
          schema={props.schema}
          state={props.editorState}
          onChange={props.onChange}
          onKeyDown={props.onKeyDown}
          className="editor"
        />
      </div>
    );
  }
}
