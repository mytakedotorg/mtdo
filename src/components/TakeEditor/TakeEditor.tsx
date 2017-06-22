import * as React from "react";
const { Editor } = require('slate');
import * as key from "keycode";

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