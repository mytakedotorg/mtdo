export default {
  initialState: {
    nodes: [
      {
        kind: 'block',
        type: 'title',
        nodes: [
          {
            kind: 'text',
            text: 'The title'
          }
        ]
      },
      {
        kind: 'block',
        type: 'paragraph',
        nodes: [
          {
            kind: 'text',
            text: 'The take'
          }
        ]
      }
    ]
  }
}
