import * as React from "react";
const { Editor, Placeholder } = require('slate');
import * as key from "keycode";

// Define a React component renderer for each of our text blocks.
export function TitleNode(props: any): JSX.Element {
  return (
    <h1 className="editor__title" {...props.attributes}>
      <Placeholder
        parent={props.node}
        node={props.node}
        state={props.state}
        firstOnly={false}
        className="editor__title--placeholder"
      >
        <span>My Take</span> {/*Title placeholder text*/}
      </Placeholder>
      {props.children}
    </h1>
  );
}

export function ParagraphNode(props: any): JSX.Element {
  return (
      <p className="editor__paragraph" {...props.attributes}>
        <Placeholder
          parent={props.node}
          node={props.node}
          state={props.state}
          firstOnly={false}
          className="editor__paragraph--placeholder"
        >
          <span>I believe...</span> {/*Take placeholder text*/}
        </Placeholder>
        {props.children}
      </p>
  );
}

export function ConstitutionNode(props: any): JSX.Element {
  console.log(props);
  return (
    <p className="editor__constitution" {...props.attributes}>
      {props.children}
    </p>
  )
}

export default class TakeEditor extends React.Component<TakeEditorProps, TakeEditorState> {
  constructor(props: TakeEditorProps){
    super(props);
  }
  
  render(){
    let { props } = this;
    return (
      <Editor
        schema={props.schema}
        state={props.editorState}
        onChange={props.onChange}
        onKeyDown={props.onKeyDown}
        className="editor"
      >
      </Editor>
    )
  }
}
