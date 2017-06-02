interface ConstitutionProps {
  //no props
}

interface ConstitutionState {
  constitution: object,
}

interface EventObject {
  target: {
    id: string
  }
}

interface MyDragEvent extends DragEvent {
  drag?: (event: EventObject) => void
}