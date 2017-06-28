interface MyTakeProps {
  //no props
}

interface MyTakeState {
  constitutionNodes: Array<MyReactComponentObject>,
  highlightedNodes: Array<MyReactComponentObject>,
  textIsHighlighted: boolean,
  editorState: any,         //Defined by slate. No it's not. You got this.
  schema: any,              //Defined by slate. No it's not. You got this.
  uniqueKey: string
}
