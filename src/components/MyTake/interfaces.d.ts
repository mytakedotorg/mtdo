interface MyTakeProps {
  //no props
  initState: any;
}

interface MyTakeState {
  constitutionNodes: Array<MyReactComponentObject>,
  amendmentsNodes: Array<MyReactComponentObject>,
  highlightedConstitutionNodes: Array<MyReactComponentObject>,
  highlightedAmendmentsNodes: Array<MyReactComponentObject>,
  constitutionTextIsHighlighted: boolean,
  amendmentsTextIsHighlighted: boolean,
  editorState: any,         //Defined by slate. No it's not. You got this.
  schema: any,              //Defined by slate. No it's not. You got this.
  uniqueKey: string
}
