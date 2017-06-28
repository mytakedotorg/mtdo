interface TakeEditorProps {
  editorState: SlateEditorState,
  schema: SlateSchema,
  onChange: (editorState: SlateEditorState) => void,
  onKeyDown: (event: KeyboardEvent, data: any, state: SlateEditorState) => SlateEditorState
}

interface SlateEditorState {
  document: SlateDocument,
  selection: SlateSelection,
  transform: any, //function
  blocks: any, //Immutable.List<SlateBlock>
  nodes: any, //Immutable.List<SlateNode>
  endBlock: SlateBlock
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
  isFocused: boolean
  isCollapsed: boolean,
  hasEdgeAtStartOf: (node: SlateNode) => boolean,
  hasEdgeIn: (node: SlateNode) => boolean
}

interface SlateProps {
  attributes: any,
  children: any,
  node: SlateBlock,
  state: SlateEditorState
}

interface SlateNode {
  kind: string,
  length: number,
  text: string
}

interface SlateBlock extends SlateNode {
  data: any, //Slate.Data
  isVoid: boolean,
  key: string,
  nodes: any, //Immutable.List<Slade.Node>
  type: string
}

interface SlateDocument {
  data: any, //Slate.Data
  nodes: any, //Immutable.List<Slate.Node>
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
