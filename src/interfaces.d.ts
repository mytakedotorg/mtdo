interface TakeEditorProps {
  editorState: any,         //Defined by slate
  schema: any,              //Defined by slate
  onChange: (editorState: TakeEditorOnChange) => void,
  onKeyDown: (event: KeyboardEvent, data: any, state: any) => any
}

interface TakeEditorState {
}

interface TakeEditorOnChange {
  editorState: any,         //Defined by slate
}

interface TakeEditorSelection {
  anchorKey: string,
  anchorOffset: number,
  focusKey: string,
  focusOffset: number
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
