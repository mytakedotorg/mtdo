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
export interface EventHandlers {
	handleDelete: (id: number) => void;
	handleEnterPress: () => void;
	handleFocus: (id: number) => void;
	handleMouseOver: (id: number) => void;
	handleMouseLeave: (id: number) => void;
}
export interface ParagraphBlockProps {
	id: number;
	onChange: (id: number, value: string) => void;
	block: ParagraphBlock;
	eventHandlers: EventHandlers;
}
export interface DocumentBlockProps {
	id: number;
	block: DocumentBlock;
	eventHandlers: EventHandlers;
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
	private textarea: HTMLTextAreaElement;
	constructor(props: ParagraphBlockProps){
		super(props);

		this.componentDidMount = this.componentDidMount.bind(this);
	}
	handleBlur = () => {
		// Paragraph is about to lose focus. If empty, should be removed.
		if (!this.props.block.text) {
			this.props.eventHandlers.handleDelete(this.props.id);
		}
	}
	handleKeyDown = (ev: React.KeyboardEvent<HTMLTextAreaElement>) => {
		switch (ev.keyCode) {
			case keycode('enter'):
				ev.preventDefault();
				this.props.eventHandlers.handleEnterPress();
				break;
			case keycode('backspace') || keycode('delete'):
				if (!this.props.block.text) {
					this.props.eventHandlers.handleDelete(this.props.id);
				}
				break;
			default:
				break;
		}
	}
	handleChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
	 	this.props.onChange(this.props.id, ev.target.value);
	}
	handleClick = () => {
		this.props.eventHandlers.handleFocus(this.props.id);
	}
	handleFocus = () => {
		this.props.eventHandlers.handleFocus(this.props.id);
	}
	handleMouseOver = () => {
		this.props.eventHandlers.handleMouseOver(this.props.id);
	}
	handleMouseLeave = () => {
		this.props.eventHandlers.handleMouseLeave(this.props.id);
	}
	componentDidMount() {
		//console.log(this.textarea);
		this.textarea.focus();
	}
	render() {
		return (
			<textarea 
				className="editor__paragraph"
				onBlur={this.handleBlur}
				onChange={this.handleChange}
				onClick={this.handleClick}
				onFocus={this.handleFocus}
				onKeyDown={this.handleKeyDown}
				onMouseOver={this.handleMouseOver} 
				onMouseLeave={this.handleMouseLeave} 
				value={this.props.block.text}
				ref={(textarea: HTMLTextAreaElement) => this.textarea = textarea}
			>
			</textarea>
		);
	}
}

class Document extends React.Component<DocumentBlockProps, void> {
	constructor(props: DocumentBlockProps){
    super(props);
	}
	handleClick = () => {
		this.props.eventHandlers.handleFocus(this.props.id);
	}
	handleFocus = () => {
		this.props.eventHandlers.handleFocus(this.props.id);
	}
	handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
		switch (ev.keyCode) {
			case keycode('enter'):
				this.props.eventHandlers.handleEnterPress();
				break;
			case keycode('backspace') || keycode('delete'):
				this.props.eventHandlers.handleDelete(this.props.id);
				break;
			default:
				break;
		}
	}
	handleMouseOver = () => {
		this.props.eventHandlers.handleMouseOver(this.props.id);
	}
	handleMouseLeave = () => {
		this.props.eventHandlers.handleMouseLeave(this.props.id);
	}
	render(){
		return (
			<div 
				tabIndex={0}
				className="editor__document"
				onClick={this.handleClick}
				onFocus={this.handleFocus}
				onKeyDown={this.handleKeyDown}
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
	handleDelete: (id: number) => void;
	handleChange: (id: number, value: string) => void;
	handleFocus: (id: number) => void;
	handleEnter: () => void;
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
		const eventHandlers: EventHandlers = {
			handleDelete: props.handleDelete,
			handleEnterPress: props.handleEnter,
			handleFocus: props.handleFocus,
			handleMouseOver: props.handleMouseOver,
			handleMouseLeave: props.handleMouseLeave
		}
		switch (props.block.kind) {
			case 'paragraph': 
				inner = <Paragraph 
					block={props.block}
					id={props.index}
					onChange={props.handleChange}
					eventHandlers={eventHandlers}
					/>; 
				break;
			case 'document':  
				inner = <Document
					block={props.block}
					id={props.index}
					eventHandlers={eventHandlers}
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
	handleChange: (id: number, value: string) => void;
	handleDelete: (id: number) => void;
	handleEnter: () => void;
	handleFocus: (id: number) => void;
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
							handleDelete={props.handleDelete}
							handleChange={props.handleChange}
							handleFocus={props.handleFocus}
							handleEnter={props.handleEnter}
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
