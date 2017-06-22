interface ConstitutionProps {
  //no props
}

interface ConstitutionState {
  constitutionStructure: object, 
  constitutionNodes: Array<React.ReactNode>,
  textIsHighlighted: boolean
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