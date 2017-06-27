interface TakeEditorProps {
  editorState: SlateEditorState,
  schema: SlateSchema,
  onChange: (editorState: SlateEditorState) => void,
  onKeyDown: (event: KeyboardEvent, data: any, state: SlateEditorState) => SlateEditorState
}

interface SlateEditorState {
  document: Document,
  selection: SlateSelection
}

interface SlateSchema {
  nodes: Object,
  marks: Object,
  rules: Array<any>
}

interface SlateSelection {
  anchorKey: string,
  anchorOffset: number,
  focusKey: string,
  focusOffset: number,
  isBackward: boolean,
  isFocues: boolean
}

interface SlateProps {
  attributes: any,
  children: any,
  node: SlateNode,
  state: SlateEditorState
}

interface SlateNode extends SlateBlock {
  kind: string,
  length: number,
  text: string
}

interface SlateBlock {
  data: any, //Slate.Data
  isVoid: boolean,
  key: string,
  nodes: any, //Immutable.List<Slade.Node>
  type: string
}
interface MyReactComponentObject {
  component: string,
  props: MyComponentPropsObject,
  innerHTML: Array<string | React.ReactNode>
}

interface MyComponentPropsObject {
  key?: string,
  dataOffset: string,
  ref: any,
  children?: React.ReactNode
}
