import TakeEditor, { AmendmentsNode, TitleNode, ParagraphNode, ConstitutionNode } from './TakeEditor';
const { Raw } = require('slate');

export { AmendmentsNode, TitleNode, ParagraphNode, ConstitutionNode }
export default TakeEditor;

interface ParagraphBlock {
    kind: 'paragraph';
    text: string;
}
interface DocumentBlock {
    kind: 'document';
    document: string;
    range: [number, number];
}
type TakeBlock = ParagraphBlock | DocumentBlock;

export interface TakeDocument {
    title: string;
    blocks: TakeBlock[];
}

function blockToSlate(block: TakeBlock): any {
    switch (block.kind) {
        case 'paragraph':
            return {
                kind: 'block',
                type: 'paragraph',
                nodes: [
                    {
                        kind: 'text',
                        text: block.text,
                    }
                ]
            };
        case 'document':
            return {
                kind: 'block',
                type: 'paragraph',
                nodes: [
                    {
                        kind: 'text',
                        text: 'From ' + block.document + ', range ' + block.range
                    }
                ]
            };
    }
    // TODO: if we turn on --strictNullChecks, the compiler will make sure
    // that we covered every kind of TakeBlock
}

export function toSlateDocument(input: TakeDocument): any {
    let nodes = [
        {
            kind: 'block',
            type: 'title',
            nodes: [
                {
                    kind: 'text',
                    text: input.title
                }
            ]
        }
    ];
    for (let block of input.blocks) {
        nodes.push(blockToSlate(block));
    }
    return Raw.deserialize({
        nodes: nodes
    }, { terse: true });
}
