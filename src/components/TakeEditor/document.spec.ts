import * as take from './index';

test('parse a simple document', () => {
    let doc: take.TakeDocument = {
        title: "My take title",
        blocks: [
        {
            kind: 'paragraph',
            text: 'Some text'
        },
        {
            kind: 'document',
            document: 'Constitution',
            range: [1, 25]
        }
    ]};
    expect(doc.title).toBe('My take title')
})
