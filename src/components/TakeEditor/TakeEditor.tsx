import * as React from "react";
const { Editor, Raw } = require('slate');

// Define a React component renderer for our code blocks.
function TitleNode(props: ITakeEditor__TitleNode) {
  return <h1 className="editor__title" {...props.attributes}>{props.children}</h1>
}

const initialState = Raw.deserialize({
  nodes: [
    {
      kind: 'block',
      type: 'title',
      nodes: [
        {
          kind: 'text',
          text: 'The title'
        }
      ]
    },
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
      editorState: initialState,
      schema: {
        nodes: {
          title: TitleNode
        }
      }
    }
    this.onChange = this.onChange.bind(this);
  }
  // On change, update the app's React state with the new editor state.
  onChange(editorState: ITakeEditor__OnChange): void {
    this.setState({ editorState })
  }
  render(){
    return (
      <Editor
        schema={this.state.schema}
        state={this.state.editorState}
        onChange={this.onChange}
        className="editor"
      />
    )
  }
}


export default TakeEditor;
