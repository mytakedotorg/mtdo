interface ConstitutionProps {
  constitutionNodes: Array<MyReactComponentObject>,
  onClick: () => void,
  onMouseUp: () => void,
}

interface ConstitutionState {

}

interface EventObject {
  target: {
    id: string
  }
}

interface MyDragEvent extends DragEvent {
  drag?: (event: EventObject) => void
}

interface rangeData {
  start: number,
  end: number
}