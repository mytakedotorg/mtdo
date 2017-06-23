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
        className="editor__placeholder"
      >
        <span>My Take</span> {/*Title placeholder text*/}
      </Placeholder>
      {props.children}
    </h1>
  );
}

export function ParagraphNode(props: any): JSX.Element {
  //<div className="droppable" onDragOver={onDragOver} onDrop={onDrop}>
  return (
    <div className="droppable" >
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

class TakeEditor extends React.Component<TakeEditorProps, TakeEditorState> {
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

export default TakeEditor;

function onDragOver(ev: React.DragEvent<HTMLDivElement>) {
  ev.preventDefault(); //Allow drop event
}
function onDrop(ev: React.DragEvent<HTMLDivElement>) {
  ev.preventDefault(); //Allow drop event
  console.log(ev.target);
  // let data = ev.dataTransfer.getData('text');
  // console.log('dropped: ' + data);
  // console.log('effectAllowed: ' + ev.dataTransfer.effectAllowed);
  // /**
  //  * Spec says to do appendChild to ev.target, but not necessary. Don't know why???
  //  * (ev.target as HTMLDivElement).appendChild(data); 
  //  */
  // console.log(ev.target);
  // let newP = document.createElement("p");
  // newP.innerHTML = "something else";
  // (ev.target as HTMLDivElement).appendChild(newP);
}