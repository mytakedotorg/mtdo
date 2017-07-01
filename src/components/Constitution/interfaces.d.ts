interface ConstitutionProps {
  constitutionNodes: Array<MyReactComponentObject>,
  textIsHighlighted: boolean,
  onBackClick: () => void,
  onClearClick: () => void,
  onSetClick: () => void,
  onMouseUp: () => void
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