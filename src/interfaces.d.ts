interface ITakeEditorProps {
  //no props
}

interface ITakeEditorState {
  editorState: any,
  schema: any,
}

interface ITakeEditor__OnChange {
  editorState: {
    nodes: Array<object>,
  } 
}

interface ITakeEditor__TitleNode {
  //See slate@0.20.1/lib/components/content.js:931
  attributes: {
    'data-key': string,  //data-key
    onDragStart: (event: any) => void,
  },
  children: Array<object>,
}