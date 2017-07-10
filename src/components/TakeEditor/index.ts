import TakeEditor, { AmendmentsNode, TitleNode, ParagraphNode, ConstitutionNode } from './TakeEditor';

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
