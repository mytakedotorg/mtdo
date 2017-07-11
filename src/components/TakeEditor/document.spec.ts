import * as take from './index';

test('convert a simple document to slate', () => {
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
    let result = take.toSlateDocument(doc);
    expect(result.document.nodes.get(0).type).toBe('title')
    expect(result.document.nodes.get(1).type).toBe('paragraph')
    expect(result.document.nodes.get(2).type).toBe('paragraph')
})
