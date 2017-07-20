import * as React from "react";

////////////////////
// Document model //
////////////////////
export interface ParagraphBlock {
	id: number,
	kind: 'paragraph';
	text: string;
	onChange?: (id: number, value: string) => void;
	onClick?: (id: number) => void;
	onMouseOver?: (id: number) => void;
	onMouseLeave?: (id: number) => void;
	active?: boolean;
  hover?: boolean;
}
export interface DocumentBlock {
	id: number,
  kind: 'document';
  document: string;
	range: [number, number];
	active?: boolean;
  hover?: boolean;
}
export type TakeBlock = ParagraphBlock | DocumentBlock;

export interface TakeDocument {
  title: string;
  blocks: TakeBlock[];
}

/////////////////
// React model //
/////////////////
class Paragraph extends React.Component<ParagraphBlock, void> {
	constructor(props: ParagraphBlock){
		super(props);
	}
	handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
		this.props.onChange(this.props.id, ev.target.value);
	}
	handleClick = () => {
		this.props.onClick(this.props.id);
	}
	handleMouseOver = () => {
		this.props.onMouseOver(this.props.id);
	}
	handleMouseLeave = () => {
		this.props.onMouseLeave(this.props.id);
	}
	render() {
		return (
			<textarea 
				className="editor__paragraph"
				onChange={this.handleChange}
				onClick={this.handleClick}
				onMouseOver={this.handleMouseOver} 
				onMouseLeave={this.handleMouseLeave} 
				value={this.props.text}>
			</textarea>
		);
	}
}

function Document(props: DocumentBlock) {
  return (<div className="editor__document">{props.document} range {props.range.toString()}</div>)
}

export interface BlockContainerProps {
	block: TakeBlock;
	handleChange: (id: number, value: string) => void;
	handleClick: (id: number) => void;
	handleMouseOver: (id: number) => void;
	handleMouseLeave: (id: number) => void;
  active: boolean;
  hover: boolean;
}

class BlockContainer extends React.Component<BlockContainerProps, void> {
	constructor(props: BlockContainerProps){
    super(props);
  }
	render(){
		let inner;
		const { props } = this;
		switch (props.block.kind) {
			case 'paragraph': 
				inner = <Paragraph 
						{...props.block} 
						onChange={props.handleChange}
						onClick={props.handleClick}
						onMouseOver={props.handleMouseOver} 
						onMouseLeave={props.handleMouseLeave}
					/>; 
			break;
			case 'document':  inner = Document(props.block);  break;
		}

		let classes = 'editor__block';
		if (props.hover) {
			classes += ' editor__block--hover'
		}
		if (props.active) {
			classes += ' editor__block--active'
		}
		return (
			<div className={classes}>
				{inner}
			</div>
		)
	}
}

export interface BlockEditorProps {
	handleChange?: (id: number, value: string) => void;
	handleClick?: (id: number) => void;
	handleMouseOver?: (id: number) => void;
	handleMouseLeave?: (id: number) => void;
	takeDocument: TakeDocument;
  active?: boolean;
  hover?: boolean;
}

export function BlockEditor(props: BlockEditorProps) {
	return (
		<div className="editor__wrapper">
			<div className="editor">
				<h2 className="editor__title">{props.takeDocument.title}</h2>
				{props.takeDocument.blocks.map((block) =>
					<BlockContainer 
						key={block.id}
						block={block}
						handleChange={props.handleChange}
						handleClick={props.handleClick}
						handleMouseOver={props.handleMouseOver}
						handleMouseLeave={props.handleMouseLeave}
						active={block.active}
						hover={block.hover} 
					/>
				)}
			</div>
		</div>
	);
}

export default BlockEditor;
