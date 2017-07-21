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
export interface MouseCallBacks {
	onClick: (id: number) => void;
	onMouseOver: (id: number) => void;
	onMouseLeave: (id: number) => void;
}
export interface ParagraphBlockProps {
	id: number;
	onChange: (id: number, value: string) => void;
	block: ParagraphBlock;
	mouseCallBacks: MouseCallBacks;
}
export interface DocumentBlockProps {
	id: number;
	block: DocumentBlock;
	mouseCallBacks: MouseCallBacks;
}
export type TakeBlock = ParagraphBlock | DocumentBlock;

export interface TakeDocument {
  title: string;
	blocks: TakeBlock[];
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
		this.props.mouseCallBacks.onClick(this.props.id);
	}
	handleMouseOver = () => {
		this.props.mouseCallBacks.onMouseOver(this.props.id);
	}
	handleMouseLeave = () => {
		this.props.mouseCallBacks.onMouseLeave(this.props.id);
	}
	render() {
		return (
			<textarea 
				className="editor__paragraph"
				onChange={this.handleChange}
				onClick={this.handleClick}
				onMouseOver={this.handleMouseOver} 
				onMouseLeave={this.handleMouseLeave} 
				value={this.props.block.text}>
			</textarea>
		);
	}
}

class Document extends React.Component<DocumentBlockProps, void> {
	constructor(props: DocumentBlockProps){
    super(props);
	}
	handleClick = () => {
		this.props.mouseCallBacks.onClick(this.props.id);
	}
	handleMouseOver = () => {
		this.props.mouseCallBacks.onMouseOver(this.props.id);
	}
	handleMouseLeave = () => {
		this.props.mouseCallBacks.onMouseLeave(this.props.id);
	}
	render(){
		return (
			<div 
				className="editor__document"
				onClick={this.handleClick}
				onMouseOver={this.handleMouseOver}
				onMouseLeave={this.handleMouseLeave}
			>
				{this.props.block.document} range {this.props.block.range.toString()}
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
		const mouseCallBacks = {
			onClick: props.handleClick,
			onMouseOver: props.handleMouseOver,
			onMouseLeave: props.handleMouseLeave
		}
		const block = {
			...props.block
		}

		switch (props.block.kind) {
			case 'paragraph': 
				inner = <Paragraph 
					block={block}
					id={props.index}
					onChange={props.handleChange}
					mouseCallBacks={mouseCallBacks}
					/>; 
				break;
			case 'document':  
				inner = <Document
					block={block}
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
	takeDocument: TakeDocument;
	active: number;
}

export interface BlockEditorState {
	hover: number;
}

class BlockEditor extends React.Component<BlockEditorProps, BlockEditorState> {
	constructor(props: BlockEditorProps){
		super(props);

		this.state = {
			hover: -1
		}
	}
	handleMouseOver = (id: number): void  => {
		this.setHover(id);
	}
	handleMouseLeave = (id: number): void  => {
		this.clearHover();
	}
	setHover = (id: number): void => {
		this.setState({
			hover: id
		});
	}
	clearHover = (): void => {
		this.setState({
			hover: -1
		})
	}
	render(){
		const { props } = this;
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
							handleMouseOver={this.handleMouseOver}
							handleMouseLeave={this.handleMouseLeave}
							active={idx === props.active}
							hover={idx === this.state.hover}
						/>
					)}
				</div>
			</div>
		);
	}
}

export default BlockEditor;
