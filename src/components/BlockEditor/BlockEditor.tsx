import * as React from "react";

////////////////////
// Document model //
////////////////////
export interface ParagraphBlock {
    kind: 'paragraph';
    text: string;
}
export interface DocumentBlock {
    kind: 'document';
    document: string;
    range: [number, number];
}
export type TakeBlock = ParagraphBlock | DocumentBlock;

export interface TakeDocument {
    title: string;
    blocks: TakeBlock[];
}

/////////////////
// React model //
/////////////////
function Paragraph(props: ParagraphBlock) {
    return (<div className="blockcontainer__paragraph">{props.text}</div>)
}

function Document(props: DocumentBlock) {
    return (<div className="blockcontainer__document">{props.document} range {props.range.toString()}</div>)
}

export interface BlockContainerProps {
    block: TakeBlock;
    active: boolean;
    hover: boolean;
}

function BlockContainer(props: BlockContainerProps) {
    let inner;
    switch (props.block.kind) {
        case 'paragraph': inner = Paragraph(props.block); break;
        case 'document':  inner = Document(props.block);  break;
    }

    let classes = 'blockcontainer';
    if (props.hover) {
        classes += ' blockcontainer--hover'
    }
    if (props.active) {
        classes += ' blockcontainer--active'
    }
    return (
        <div className={classes}>
            {inner}
        </div>
    )
}

export interface BlockEditorProps {
    blocks: TakeBlock[];
    active?: number;
    hover?: number;
}

export function BlockEditor(props: BlockEditorProps) {
    const blocks = props.blocks.map((block, idx) =>
            <BlockContainer key={idx.toString()}
                block={block}
                active={idx === props.active}
                hover={idx === props.hover} />
        )
    return (<div className="blockeditor">{blocks}</div>)
}

export default BlockEditor;
