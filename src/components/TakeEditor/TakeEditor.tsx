import * as React from "react";
import config from "./config";
const { Editor, Placeholder, Raw } = require('slate');
import * as key from "keycode";

// Define a React component renderer for each of our text blocks.
function TitleNode(props: any): JSX.Element {
  return (
    <h1 className="editor__title" {...props.attributes}>
      <Placeholder
        parent={props.node}
        node={props.node}
        state={props.state}
        firstOnly={false}
        className="editor__placeholder"
      >
        <span>My Take</span> {/*Title placeholder text*/}
      </Placeholder>
      {props.children}
    </h1>
  );
}

function onDragOver(ev: React.DragEvent<HTMLDivElement>) {
  ev.preventDefault(); //Allow drop event
}
function onDrop(ev: React.DragEvent<HTMLDivElement>) {
  ev.preventDefault(); //Allow drop event
  let data = ev.dataTransfer.getData('text');
  console.log('dropped ' + data);
 // (ev.target as HTMLDivElement).appendChild(data);
}

function ParagraphNode(props: any): JSX.Element {
  return (
    <div className="droppable" onDragOver={onDragOver} onDrop={onDrop}>
      <p className="editor__title" {...props.attributes}>
        <Placeholder
          parent={props.node}
          node={props.node}
          state={props.state}
          firstOnly={false}
          className="editor__placeholder"
        >
          <span>I believe...</span> {/*Take placeholder text*/}
        </Placeholder>
        {props.children}
      </p>
    </div>
  );
}

function TitlePlaceHolder(props: any): JSX.Element {
  console.log("titleplaceholder props: " + props);
  return (
    <Placeholder
      node={TitleNode}
      parent={TitleNode}
    >
      Placehodler text
      {props.children}
    </Placeholder>
  );
}

const initialState: any = Raw.deserialize(config.initialState, { terse: true })

class TakeEditor extends React.Component<ITakeEditorProps, ITakeEditorState> {
  constructor(props: ITakeEditorProps){
    super(props);
    this.state = {
      editorState: initialState,
      schema: {
        nodes: {
          title: TitleNode,
          paragraph: ParagraphNode,
        }
      }
    }
    this.onChange = this.onChange.bind(this);
  }
  // On change, update the app's React state with the new editor state.
  onChange(editorState: ITakeEditor__OnChange): void {
    this.setState({ editorState })
  }
  onKeyDown(event: KeyboardEvent, data: any, state: any): any{
    // Determine whether cursor is in title block
    const isTitle = state.blocks.some((block: any) => block.type == 'title')
    
    // If enter is pressed in title block, don't insert newline
    if (event.which == key('Enter') && isTitle) {
      return state;
    }

    return;
  }
  render(){
    return (
      <Editor
        schema={this.state.schema}
        state={this.state.editorState}
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        placeholder={'placeholder text'}
        className="editor"
      >
      </Editor>
    )
  }
}


export default TakeEditor;
