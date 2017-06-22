interface MyTakeProps {
  //no props
}

interface MyTakeState {
  constitutionNodes: Array<MyReactComponentObject>,
  textIsHighlighted: boolean,
  dragData: string,
  editorState: any,         //Defined by slate. No it's not. You got this.
  schema: any,              //Defined by slate. No it's not. You got this.
}
