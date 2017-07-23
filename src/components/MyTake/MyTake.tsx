import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditor, { DocumentBlock, ParagraphBlock, TakeBlock, TakeDocument } from '../BlockEditor';
import Foundation, { FoundationNode, FoundationTextTypes } from '../Foundation';
import * as key from "keycode";
import getNodeArray from "../../utils/getNodeArray";
const constitutionText = require('../../foundation/constitution.foundation.html');
const amendmentsText = require('../../foundation/amendments.foundation.html');
import config from "./config";

interface MyTakeProps {
	//initState: SlateEditorState;
}

interface MyTakeState {
  amendmentsNodes: Array<FoundationNode>,
  highlightedAmendmentsNodes: Array<FoundationNode>,
  amendmentsTextIsHighlighted: boolean,
  takeDocument: TakeDocument,
	uniqueKey: string,
	activeBlockIndex: number
}


class MyTake extends React.Component<MyTakeProps, MyTakeState> {
  constructor(props: MyTakeProps){
    super(props);

    this.state = {
      amendmentsNodes: this.getInitialText('AMENDMENTS'),
      amendmentsTextIsHighlighted: false,
      highlightedAmendmentsNodes: [],
      takeDocument: {
				title: 'My Title',
        blocks: [
					{ kind: 'paragraph', text: 'Use your voice here.' }
				]
			},
			activeBlockIndex: -1,
      uniqueKey: 'aa' // Only works 26^2 times. I think that'll be enough.
    }

    this.handleConstitutionSetClick = this.handleConstitutionSetClick.bind(this);
    this.handleAmendmentsMouseUp = this.handleAmendmentsMouseUp.bind(this);
    this.handleAmendmentsClearClick = this.handleAmendmentsClearClick.bind(this);
		this.handleAmendmentsSetClick = this.handleAmendmentsSetClick.bind(this);
	}
	addDocument = (type: FoundationTextTypes, range: [number, number]): void => {
		const blocks = this.state.takeDocument.blocks;
		let activeBlockIndex = this.state.activeBlockIndex;

		const newBlock: DocumentBlock = {
			kind: 'document',
			document: type,
			range: range
		}

		const newBlocks = [
			...blocks.slice(0, activeBlockIndex + 1),
			newBlock,
			...blocks.slice(activeBlockIndex + 1)
		];
		
		this.setState({
			takeDocument: {
				...this.state.takeDocument,
				blocks: newBlocks
			},
			activeBlockIndex: ++activeBlockIndex
		});
	}
	addParagraph = (): void => {
		const blocks = this.state.takeDocument.blocks;
		let activeBlockIndex = this.state.activeBlockIndex;

		const newBlock: ParagraphBlock = {
			kind: 'paragraph',
			text: 'new block'
		}

		const newBlocks = [
			...blocks.slice(0, activeBlockIndex + 1),
			newBlock,
			...blocks.slice(activeBlockIndex + 1)
		];
		
		this.setState({
			takeDocument: {
				...this.state.takeDocument,
				blocks: newBlocks
			},
			activeBlockIndex: ++activeBlockIndex
		});
	}
	removeParagraph = (id: number): void =>{
		const blocks = this.state.takeDocument.blocks;
		if (blocks.length > 1 ) {
			this.setState({
				takeDocument:{
					...this.state.takeDocument,
					blocks: [
						...blocks.slice(0, id),
						...blocks.slice(id + 1)
					]
				}
			})
		} else {
			if (blocks[0].kind === 'document'){
				//User wants a fresh take, so give user an empty paragraph.
				this.setState({
					takeDocument:{
						...this.state.takeDocument,
						blocks: [
							{ kind: 'paragraph', text: '' }
						]
					}
				});
			}
		}
	}
  getInitialText(type: FoundationTextTypes): Array<FoundationNode> {
    let initialText;
    switch (type) {
      case 'AMENDMENTS':
        initialText = getNodeArray(amendmentsText);
        return initialText;
      case 'CONSTITUTION':
        initialText = getNodeArray(constitutionText);
        return initialText;
      default:
        break;
    }
  }
  incrKey(letter: string): string {
    if( letter[1] === 'z') {
      return String.fromCharCode(letter[0].charCodeAt(0) + 1) + 'a';
    } else {
      return letter[0] + String.fromCharCode(letter[1].charCodeAt(0) + 1);
    }
  }
  handleAmendmentsClearClick(): void {
    this.setState({
      amendmentsNodes: this.getInitialText('AMENDMENTS'),  //Clear existing highlights
      amendmentsTextIsHighlighted: false
    });
  }
  handleAmendmentsSetClick(): void {
		//TODO
  }
  handleConstitutionSetClick(): void {
		//TODO
  }
  handleAmendmentsMouseUp(): void {
    if (window.getSelection && !this.state.amendmentsTextIsHighlighted) { // Pre IE9 will always be false
      let selection: Selection = window.getSelection();
      if (selection.toString().length) {  //Some text is selected
        let range: Range = selection.getRangeAt(0);
        //this.highlightText(range, 'AMENDMENTS');
      }
    }
  }
	handleTakeBlockChange = (id: number, value: string): void => { 
		const blocks = this.state.takeDocument.blocks;
		
		const newBlock = blocks[id] as ParagraphBlock;
		newBlock.text = value;
		
		const newBlocks = [
			...blocks.slice(0, id),
			newBlock,
			...blocks.slice(id + 1)
		];
		
		this.setState({
			takeDocument: {
				...this.state.takeDocument,
				blocks: newBlocks
			}
		});
	}
	handleTakeBlockFocus = (id: number): void  => {
		this.setActive(id);
	}
  setActive = (id: number): void => {
		this.setState({
			activeBlockIndex: id
		});
	}
  render(){
    return (
      <div>
        <BlockEditor 
					handleDelete={this.removeParagraph}
					handleChange={this.handleTakeBlockChange}
					handleFocus={this.handleTakeBlockFocus}
					handleEnter={this.addParagraph}
					takeDocument={this.state.takeDocument}
					active={this.state.activeBlockIndex}
        />
        <Foundation 
          onAmendmentsClearClick={this.handleAmendmentsClearClick}
          onAmendmentsSetClick={this.handleAmendmentsSetClick}
          onAmendmentsMouseUp={this.handleAmendmentsMouseUp} 
          amendmentsNodes={this.state.amendmentsNodes}
          amendmentsTextIsHighlighted={this.state.amendmentsTextIsHighlighted}
					handleSetClick={this.addDocument}
        />
      </div>
    )
  }
}


export default MyTake;
