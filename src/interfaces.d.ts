interface ITakeEditorProps {
  //no props
}

interface ITakeEditorState {
  editorState: any,         //Defined by slate
  schema: any,              //Defined by slate
}

interface ITakeEditor__OnChange {
  editorState: any,         //Defined by slate
}

interface MyReactComponentObject {  //Remame this
  component: string,
  props: MyComponentPropsObject,
  innerHTML: Array<string | React.ReactNode>
}

interface MyComponentPropsObject {  //Remame this
  key?: string,
  dataOffset: string,
  ref: any,
  children?: React.ReactNode
}
