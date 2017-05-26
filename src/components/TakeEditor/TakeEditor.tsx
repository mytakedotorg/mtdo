import * as React from "react";
const { Editor, Raw } = require('slate');

const initialState = Raw.deserialize({
  nodes: [
    {
      kind: 'block',
      type: 'paragraph',
      nodes: [
        {
          kind: 'text',
          text: 'A line of text in a paragraph.'
        }
      ]
    }
  ]
}, { terse: true })

class TakeEditor extends React.Component<ITakeEditorProps, ITakeEditorState> {
  constructor(props: ITakeEditorProps){
    super(props);
    this.state = {
      editorState: initialState
    }
    this.onChange = this.onChange.bind(this);
  }
  // On change, update the app's React state with the new editor state.
  //onChange = (editorState: ITakeEditorOnChange): void  => {
  onChange(editorState: ITakeEditor__OnChange): void {
    this.setState({ editorState })
  }
  render(){
    return (
      <Editor
        state={this.state.editorState}
        onChange={this.onChange}
        className="editor"
      />
    )
  }
}


export default TakeEditor;
