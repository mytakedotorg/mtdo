import * as React from "react";
import * as ReactDOM from "react-dom";
import BlockEditor, { ParagraphBlock, TakeBlock, TakeDocument } from '../BlockEditor';
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
  constitutionNodes: Array<FoundationNode>,
  amendmentsNodes: Array<FoundationNode>,
  highlightedConstitutionNodes: Array<FoundationNode>,
  highlightedAmendmentsNodes: Array<FoundationNode>,
  constitutionTextIsHighlighted: boolean,
  amendmentsTextIsHighlighted: boolean,
  takeDocument: TakeDocument,
	uniqueKey: string,
	activeBlockIndex: number
}


class MyTake extends React.Component<MyTakeProps, MyTakeState> {
  constructor(props: MyTakeProps){
    super(props);

    this.state = {
      constitutionNodes: this.getInitialText('CONSTITUTION'),
      amendmentsNodes: this.getInitialText('AMENDMENTS'),
      constitutionTextIsHighlighted: false,
      amendmentsTextIsHighlighted: false,
      highlightedConstitutionNodes: [],
      highlightedAmendmentsNodes: [],
      takeDocument: {
				title: 'My Title',
        blocks: [
					{ kind: 'paragraph', text: 'Use your voice here.' },
					{ kind: 'document', document: 'CONSTITUTION', range: [1, 364] },
				]
			},
			activeBlockIndex: -1,
      uniqueKey: 'aa' // Only works 26^2 times. I think that'll be enough.
    }

    this.handleConstitutionMouseUp = this.handleConstitutionMouseUp.bind(this);
    this.handleConstitutionClearClick = this.handleConstitutionClearClick.bind(this);
    this.handleConstitutionSetClick = this.handleConstitutionSetClick.bind(this);
    this.handleAmendmentsMouseUp = this.handleAmendmentsMouseUp.bind(this);
    this.handleAmendmentsClearClick = this.handleAmendmentsClearClick.bind(this);
		this.handleAmendmentsSetClick = this.handleAmendmentsSetClick.bind(this);
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
  clearDefaultDOMSelection(): void {
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else { 
      // pre IE 9, unsupported
    }
  }
  incrKey(letter: string): string {
    if( letter[1] === 'z') {
      return String.fromCharCode(letter[0].charCodeAt(0) + 1) + 'a';
    } else {
      return letter[0] + String.fromCharCode(letter[1].charCodeAt(0) + 1);
    }
  }
  handleConstitutionClearClick(): void {
    this.setState({
      constitutionNodes: this.getInitialText('CONSTITUTION'),  //Clear existing highlights
      constitutionTextIsHighlighted: false
    });
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
        this.highlightText(range, 'AMENDMENTS');
      }
    }
  }
  handleConstitutionMouseUp(): void {
    if (window.getSelection && !this.state.constitutionTextIsHighlighted) { // Pre IE9 will always be false
      let selection: Selection = window.getSelection();
      if (selection.toString().length) {  //Some text is selected
        let range: Range = selection.getRangeAt(0);
        this.highlightText(range, 'CONSTITUTION');
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
  highlightText(range: Range, type: FoundationTextTypes): void {
    let secondIndexClassName;
    let thirdIndexClassName;
    let fourthIndexClassName;
    let nodes;
    let foundationClassName;
    let editorClassName;
    let setClick;
    switch (type) {
      case 'AMENDMENTS':
        secondIndexClassName = 'amendments';
        thirdIndexClassName = 'amendments__row';
        fourthIndexClassName = 'amendments__text';
        nodes = this.state.amendmentsNodes;
        foundationClassName = "amendments__text--selected";
        editorClassName = "editor__amendments--highlighted";
        setClick = this.handleAmendmentsSetClick;
        break;
      case 'CONSTITUTION':
        secondIndexClassName = 'constitution';
        thirdIndexClassName = 'constitution__row';
        fourthIndexClassName = 'constitution__text';
        nodes = this.state.constitutionNodes;
        foundationClassName = "constitution__text--selected";
        editorClassName = "editor__constitution--highlighted";
        setClick = this.handleConstitutionSetClick;
        break;
      default:
        break;
    }

    const indexOfStartContainer: number = Array.prototype.indexOf.call(
      range.startContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
      range.startContainer.parentNode);                         //Find indexOf current Node
    
    const indexOfSelectionStart: number = range.startOffset;

    const indexOfEndContainer: number = Array.prototype.indexOf.call(
      range.endContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
      range.endContainer.parentNode);                        //Find indexOf current Node

    const indexOfSelectionEnd: number = range.endOffset;

    let foundationIndex;
    let firstNodeList = ReactDOM.findDOMNode(this).childNodes;
    for(let i=0; i < firstNodeList.length; i++){
      for(let j=0; j < firstNodeList[i].attributes.length; j++){
        if(firstNodeList[i].attributes.item(j).value == 'foundation'){
          foundationIndex = i;
          break;
        }
      }
      if(foundationIndex !== undefined){
        break;
      }
    }

    let secondIndex;  //constitution | amendments
    let secondNodeList = firstNodeList[foundationIndex].childNodes;
    for(let i=0; i < secondNodeList.length; i++){
      for(let j=0; j < secondNodeList[i].attributes.length; j++){
        if(secondNodeList[i].attributes.item(j).value == secondIndexClassName){
          secondIndex = i;
          break;
        }
      }
      if(secondIndex !== undefined){
        break;
      }
    }
    
    let thirdIndex; //constitutionRow | amendmentsRow
    let thirdNodeList = secondNodeList[secondIndex].childNodes;
    for(let i=0; i < thirdNodeList.length; i++){
      for(let j=0; j < thirdNodeList[i].attributes.length; j++){
        if(thirdNodeList[i].attributes.item(j).value == thirdIndexClassName){
          thirdIndex = i;
          break;
        }
      }
      if(thirdIndex !== undefined){
        break;
      }
    }

    let fourthIndex; //constitutionText | amendmentsText
    let fourthNodeList = thirdNodeList[thirdIndex].childNodes;
    for(let i=0; i < fourthNodeList.length; i++){
      for(let j=0; j < fourthNodeList[i].attributes.length; j++){
        if(fourthNodeList[i].attributes.item(j).value == fourthIndexClassName){
          fourthIndex = i;
          break;
        }
      }
      if(fourthIndex !== undefined){
        break;
      }
    }

    const startContainer: Node = firstNodeList[foundationIndex]
      .childNodes[secondIndex]
      .childNodes[thirdIndex]
      .childNodes[fourthIndex]
      .childNodes[indexOfStartContainer];
    const endContainer: Node = firstNodeList[foundationIndex]
      .childNodes[secondIndex]
      .childNodes[thirdIndex]
      .childNodes[fourthIndex]
      .childNodes[indexOfEndContainer];

    let newNodesFull: Array<FoundationNode> = [...nodes.slice(0, indexOfStartContainer)];
    let newNodes: Array<FoundationNode> = [];
    let highlightedNodes: Array<FoundationNode> = []; //Will not be rendered yet, will be sent to TakeEditor
    let newKey = this.state.uniqueKey;

    if (startContainer === endContainer) {
      // Create a new Span element with the contents of the highlighted text
      let newSpan: React.ReactNode = React.createElement(
        'span', 
        {
          className: foundationClassName, 
          key: 'startSpan' + newKey,
          onClick: setClick
        }, 
        startContainer.textContent.substring(indexOfSelectionStart, indexOfSelectionEnd)
      );

      // Modify state array immutably
      let newNode: FoundationNode = (Object as any).assign({}, nodes[indexOfStartContainer]);
      newNode.innerHTML = [
        startContainer.textContent.substring(0, indexOfSelectionStart),
        newSpan,
        startContainer.textContent.substring(indexOfSelectionEnd, startContainer.textContent.length)
      ];

      newNodes.push(newNode);

      // Create a new Span element with the contents of the highlighted text
      let newSpan2: React.ReactNode = React.createElement(
        'span', 
        {
          className: editorClassName, 
          key: 'startSpan2' + newKey
        }, 
        startContainer.textContent.substring(indexOfSelectionStart, indexOfSelectionEnd)
      );

      // Modify state array immutably
      let newNode2: FoundationNode = (Object as any).assign({}, nodes[indexOfStartContainer]);
      newNode2.innerHTML = [
        startContainer.textContent.substring(0, indexOfSelectionStart),
        newSpan2,
        startContainer.textContent.substring(indexOfSelectionEnd, startContainer.textContent.length)
      ];

      highlightedNodes.push(newNode2);
    } else {
      // Create a new Span element with the contents of the highlighted text
      let firstNewSpan: React.ReactNode = React.createElement(
        'span', 
        {
          className: foundationClassName, 
          key: 'startSpan' + newKey,
          onClick: setClick
        }, 
        startContainer.textContent.substring(indexOfSelectionStart, startContainer.textContent.length)
      );
      
      // Modify state array immutably
      let firstNewNode: FoundationNode = (Object as any).assign({}, nodes[indexOfStartContainer]);
      firstNewNode.innerHTML = [
        startContainer.textContent.substring(0, indexOfSelectionStart),
        firstNewSpan
      ];
      
      newNodes.push(firstNewNode);

      // Create a new Span element with the contents of the highlighted text
      let firstNewSpan2: React.ReactNode = React.createElement(
        'span', 
        {
          className: editorClassName, 
          key: 'startSpan2' + newKey
        }, 
        startContainer.textContent.substring(indexOfSelectionStart, startContainer.textContent.length)
      );
      
      // Modify state array immutably
      let firstNewNode2: FoundationNode = (Object as any).assign({}, nodes[indexOfStartContainer]);
      firstNewNode2.innerHTML = [
        startContainer.textContent.substring(0, indexOfSelectionStart),
        firstNewSpan2
      ];
      
      highlightedNodes.push(firstNewNode2);

      for(let index: number = indexOfStartContainer + 1; index < indexOfEndContainer ; index++){
        let nextNewNode: FoundationNode = (Object as any).assign({}, nodes[index]);
        let key: string = 'middleSpan-' + index.toString();
        let nextNewSpan: React.ReactNode = React.createElement(
          'span',
          {
            className: foundationClassName, 
            key: key,
            onClick: setClick
          },
          nextNewNode.innerHTML
        )
        nextNewNode.innerHTML = [nextNewSpan];

        newNodes.push(nextNewNode);

        let nextNewNode2: FoundationNode = (Object as any).assign({}, nodes[index]);
        let key2: string = 'middleSpan2-' + index.toString();
        let nextNewSpan2: React.ReactNode = React.createElement(
          'span',
          {
            className: editorClassName, 
            key: key2
          },
          nextNewNode2.innerHTML
        )
        nextNewNode2.innerHTML = [nextNewSpan2];

        highlightedNodes.push(nextNewNode2);
      }    

      // Create a new Span element with the contents of the highlighted text
      let lastNewSpan: React.ReactNode = React.createElement(
        'span', 
        {
          className: foundationClassName, 
          key: 'endSpan' + newKey,
          onClick: setClick
        }, 
        endContainer.textContent.substring(0, indexOfSelectionEnd)
      );
      // Modify state array immutably
      let lastNewNode: FoundationNode = (Object as any).assign({}, nodes[indexOfEndContainer]);
      lastNewNode.innerHTML = [
        lastNewSpan,
        endContainer.textContent.substring(indexOfSelectionEnd, endContainer.textContent.length),
      ];

      newNodes.push(lastNewNode);
    
      // Create a new Span element with the contents of the highlighted text
      let lastNewSpan2: React.ReactNode = React.createElement(
        'span', 
        {
          className: editorClassName, 
          key: 'endSpan' + newKey
        }, 
        endContainer.textContent.substring(0, indexOfSelectionEnd)
      );
      // Modify state array immutably
      let lastNewNode2: FoundationNode = (Object as any).assign({}, nodes[indexOfEndContainer]);
      lastNewNode2.innerHTML = [
        lastNewSpan2,
        endContainer.textContent.substring(indexOfSelectionEnd, endContainer.textContent.length),
      ];

      highlightedNodes.push(lastNewNode2);
    }
    
    newNodesFull = [
      ...newNodesFull,
      ...newNodes,
      ...nodes.slice(indexOfEndContainer + 1, nodes.length)
    ]
    
    newKey = this.incrKey(newKey);

    switch (type) {
      case 'AMENDMENTS':
        this.setState( prevState => ({
          amendmentsNodes: [...newNodesFull],
          amendmentsTextIsHighlighted: true,
          highlightedAmendmentsNodes: [...highlightedNodes],
          uniqueKey: newKey
        }));
        break;
      case 'CONSTITUTION':
        this.setState( prevState => ({
          constitutionNodes: [...newNodesFull],
          constitutiontextIsHighlighted: true,
          highlightedConstitutionNodes: [...highlightedNodes],
          uniqueKey: newKey
        }));
        break;
      default:
        break;
    }

    this.clearDefaultDOMSelection();
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
					constitutionNodes={this.state.constitutionNodes}
					takeDocument={this.state.takeDocument}
					active={this.state.activeBlockIndex}
        />
        <Foundation 
          onConstitutionClearClick={this.handleConstitutionClearClick}
          onConstitutionSetClick={this.handleConstitutionSetClick}
          onConstitutionMouseUp={this.handleConstitutionMouseUp} 
          constitutionNodes={this.state.constitutionNodes}
          textIsHighlighted={this.state.constitutionTextIsHighlighted}
          onAmendmentsClearClick={this.handleAmendmentsClearClick}
          onAmendmentsSetClick={this.handleAmendmentsSetClick}
          onAmendmentsMouseUp={this.handleAmendmentsMouseUp} 
          amendmentsNodes={this.state.amendmentsNodes}
          amendmentsTextIsHighlighted={this.state.amendmentsTextIsHighlighted}
        />
      </div>
    )
  }
}


export default MyTake;
