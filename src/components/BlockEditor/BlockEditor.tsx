import * as React from "react";
import * as keycode from "keycode";

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
export interface ParagraphBlockProps extends ParagraphBlock {
	id: number;
	onChange?: (id: number, value: string) => void;
	onClick?: (id: number) => void;
	onMouseOver?: (id: number) => void;
	onMouseLeave?: (id: number) => void;
	textarea?: HTMLTextAreaElement;
}
export interface DocumentBlockProps extends DocumentBlock {
	id: number;
	onClick?: (id: number) => void;
	onMouseOver?: (id: number) => void;
	onMouseLeave?: (id: number) => void;
}
export type TakeBlock = ParagraphBlock | DocumentBlock;

export interface TakeDocument {
  title: string;
	blocks: TakeBlock[];
	hover: number;
	active: number;
}

/////////////////
// React model //
/////////////////
class Paragraph extends React.Component<ParagraphBlockProps, void> {
	public refs: {
		textarea: HTMLTextAreaElement;
	}
	constructor(props: ParagraphBlockProps){
		super(props);
	}
	handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (ev.keyCode === keycode('enter')){
			console.log('enter pressed');

		}// else {
		//	this.handleChange();
		//}
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

class Document extends React.Component<DocumentBlockProps, void> {
	constructor(props: DocumentBlockProps){
    super(props);
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
	render(){
		return (
			<div 
				className="editor__document"
				onClick={this.handleClick}
				onMouseOver={this.handleMouseOver}
				onMouseLeave={this.handleMouseLeave}
			>
				{this.props.document} range {this.props.range.toString()}
			</div>)
	}
}

export interface BlockContainerProps {
	block: TakeBlock;
	index: number;
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
					id={props.index}
					onChange={props.handleChange}
					onClick={props.handleClick}
					onMouseOver={props.handleMouseOver} 
					onMouseLeave={props.handleMouseLeave}
					/>; 
				break;
			case 'document':  
				inner = <Document
					{...props.block}
					id={props.index}
					onClick={props.handleClick}
					onMouseOver={props.handleMouseOver}
					onMouseLeave={props.handleMouseLeave}
					/>;  
				break;
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
}

export function BlockEditor(props: BlockEditorProps) {
	return (
		<div className="editor__wrapper">
			<div className="editor">
				<h2 className="editor__title">{props.takeDocument.title}</h2>
				{props.takeDocument.blocks.map((block, idx) =>
					<BlockContainer 
						key={idx.toString()}
						index={idx}
						block={block}
						handleChange={props.handleChange}
						handleClick={props.handleClick}
						handleMouseOver={props.handleMouseOver}
						handleMouseLeave={props.handleMouseLeave}
						active={idx === props.takeDocument.active}
						hover={idx === props.takeDocument.hover}
					/>
				)}
			</div>
		</div>
	);
}

export default BlockEditor;
