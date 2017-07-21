import * as React from "react";
import * as keycode from "keycode";
import { FoundationNode, FoundationNodeProps, FoundationTextTypes } from '../Foundation';
import getNodeArray from "../../utils/getNodeArray";
const constitutionText = require('../../foundation/constitution.foundation.html');


////////////////////
// Document model //
////////////////////
export interface ParagraphBlock {
	kind: 'paragraph';
	text: string;
}
export interface DocumentBlock {
	kind: 'document';
  document: FoundationTextTypes;
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
export interface DocumentBlockState {
	constitutionNodes: FoundationNode[];
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

class Document extends React.Component<DocumentBlockProps, DocumentBlockState> {
	constructor(props: DocumentBlockProps){
		super(props);
		
		this.state = {
			constitutionNodes: this.getInitialText()
		}
	}
	getInitialText(): Array<FoundationNode> {
		let initialText = getNodeArray(constitutionText);
		return initialText;
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
		const { props } = this;
		const startRange = props.block.range[0];
		const endRange = props.block.range[1];
		const constitutionNodes: FoundationNode[] = [...this.state.constitutionNodes];
		let documentNodes: FoundationNode[] = [];
		let highlightedNodes: FoundationNode[] = [];
		switch (props.block.document) {
			case 'CONSTITUTION':
				for(let idx = 0; idx < constitutionNodes.length; idx++) {
					if (constitutionNodes[idx + 1]) {
						if (parseInt(constitutionNodes[idx + 1].props.data) < startRange) {
							continue;
						}
					}
					if (parseInt(constitutionNodes[idx].props.data) > endRange) {
						break;
					}
					documentNodes = [ ...constitutionNodes.slice(idx, idx+1) ];
				}
				//documentNodes is array with text to be highlighted
				if (documentNodes.length === 1) {
					const offset = parseInt(documentNodes[0].props.data);
					const startIndex = startRange - offset;
					const endIndex = endRange - offset;
					let newSpan: React.ReactNode = React.createElement(
						'span',
						{
							className: 'constitution__text--selected',
							key: 'somekey'
						},
						documentNodes[0].innerHTML.toString().substring(startIndex, endIndex)
					);
					let newNode: FoundationNode = (Object as any).assign({}, documentNodes[0]);
					const length = documentNodes[0].innerHTML.toString().length;
					newNode.innerHTML = [
						newNode.innerHTML.toString().substring(0, startIndex),
						newSpan,
						newNode.innerHTML.toString().substring(endIndex, length)
					]
					highlightedNodes = [newNode];
				}
				break;
			default: 
				break;
		}
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
				{props.block.document} range {props.block.range.toString()}
				{highlightedNodes.map((node, index) => {
					node.props['key'] = index.toString();
					return (
						React.createElement(node.component, node.props, node.innerHTML)
					)
				})}
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
