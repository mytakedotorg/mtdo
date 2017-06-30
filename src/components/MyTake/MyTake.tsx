import * as React from "react";
import * as ReactDOM from "react-dom";
import TakeEditor, { TitleNode, ParagraphNode, ConstitutionNode } from '../TakeEditor';
import Constitution from '../Constitution';
const { Block, Data, Raw, Selection } = require('slate');
import * as key from "keycode";
import getNodeArray from "../../utils/getNodeArray";
const constitutionText = require('../../foundation/constitution.foundation.html');
import config from "./config";

const initialState: any = Raw.deserialize(config.initialState, { terse: true })

class MyTake extends React.Component<MyTakeProps, MyTakeState> {
  constructor(props: MyTakeProps){
    super(props);

    this.state = {
      constitutionNodes: this.getInitialText(),
      textIsHighlighted: false,
      highlightedNodes: [],
      editorState: initialState,
      schema: {
        nodes: {
          title: TitleNode,
          paragraph: ParagraphNode,
          constitution: ConstitutionNode
        }
      },
      uniqueKey: 'aa' // Only works 26^2 times. I think that'll be enough.
    }

    this.handleConstitutionMouseUp = this.handleConstitutionMouseUp.bind(this);
    this.handleConstitutionClearClick = this.handleConstitutionClearClick.bind(this);
    this.handleConstitutionSetClick = this.handleConstitutionSetClick.bind(this);
    this.handleEditorChange = this.handleEditorChange.bind(this);
  }
  getInitialText(): Array<MyReactComponentObject> {
    const initialText = getNodeArray(constitutionText);
    return initialText;
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
      constitutionNodes: this.getInitialText(),  //Clear existing highlights
      textIsHighlighted: false
    });
  }
  handleConstitutionSetClick(): void {
    const currentSelection = this.state.editorState.selection;
    let selection: SlateSelection;
    if (currentSelection.anchorKey === "0" || currentSelection.focusKey === "0") {
      //Cursor is in title, insert constitution node immediately after
      let key = this.state.editorState.document.nodes.rest().first().getFirstText().key;

      selection = Selection.create({
        anchorKey: key,
        anchorOffset: 0,
        focusKey: key,
        focusOffset: 0
      });
    } else {
      selection = currentSelection;
    }
    
    let newObject = {array: this.state.highlightedNodes};
    let newKey = this.state.uniqueKey;
    const properties = {
      data: Data.create(newObject),
      key: this.state.uniqueKey,
      type: 'constitution',
      isVoid: true
    }

    newKey = this.incrKey(newKey);

    const constitutionNode = Block.create(properties);
    const newState = this.state.editorState
      .transform()
      .insertBlockAtRange(selection, constitutionNode)
      .apply();

      
    this.setState({
      editorState: newState,
      uniqueKey: newKey,
      constitutionNodes: this.getInitialText(),  //Clear existing highlights
      textIsHighlighted: false
    });
  }
  handleConstitutionMouseUp(): void {
    if (window.getSelection && !this.state.textIsHighlighted) { // Pre IE9 will always be false
      let selection: Selection = window.getSelection();
      if (selection.toString().length) {  //Some text is selected
        let range: Range = selection.getRangeAt(0);
        this.highlightText(range);
      }
    }
  }
  highlightText(range: Range): void {
    const indexOfStartContainer: number = Array.prototype.indexOf.call(
      range.startContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
      range.startContainer.parentNode);                         //Find indexOf current Node
    
    const indexOfSelectionStart: number = range.startOffset;

    const indexOfEndContainer: number = Array.prototype.indexOf.call(
      range.endContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
      range.endContainer.parentNode);                        //Find indexOf current Node

    const indexOfSelectionEnd: number = range.endOffset;

    let constitutionIndex;
    let firstNodeList = ReactDOM.findDOMNode(this).childNodes;
    for(let i=0; i < firstNodeList.length; i++){
      for(let j=0; j < firstNodeList[i].attributes.length; j++){
        if(firstNodeList[i].attributes.item(j).value == 'constitution'){
          constitutionIndex = i;
          break;
        }
      }
      if(constitutionIndex !== undefined){
        break;
      }
    }
    
    let constitutionTextIndex;
    let secondNodeList = firstNodeList[constitutionIndex].childNodes;
    for(let i=0; i < secondNodeList.length; i++){
      for(let j=0; j < secondNodeList[i].attributes.length; j++){
        if(secondNodeList[i].attributes.item(j).value == 'constitution__text'){
          constitutionTextIndex = i;
          break;
        }
      }
      if(constitutionTextIndex !== undefined){
        break;
      }
    }

    const startContainer: Node = firstNodeList[constitutionIndex].childNodes[constitutionTextIndex].childNodes[indexOfStartContainer];
    const endContainer: Node = firstNodeList[constitutionIndex].childNodes[constitutionTextIndex].childNodes[indexOfEndContainer];

    const { constitutionNodes } = this.state; 
    let newConstitutionFull: Array<MyReactComponentObject> = [...constitutionNodes.slice(0, indexOfStartContainer)];
    let newNodes: Array<MyReactComponentObject> = [];
    let highlightedNodes: Array<MyReactComponentObject> = []; //Will not be rendered yet, will be sent to TakeEditor
    let newKey = this.state.uniqueKey;

    if (startContainer === endContainer) {
      // Create a new Span element with the contents of the highlighted text
      let newSpan: React.ReactNode = React.createElement(
        'span', 
        {
          className: 'constitution__text--selected', 
          key: 'startSpan' + newKey,
          onClick: this.handleConstitutionSetClick
        }, 
        startContainer.textContent.substring(indexOfSelectionStart, indexOfSelectionEnd)
      );

      // Modify state array immutably
      let newNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfStartContainer]);
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
          className: 'editor__constitution--highlighted', 
          key: 'startSpan2' + newKey
        }, 
        startContainer.textContent.substring(indexOfSelectionStart, indexOfSelectionEnd)
      );

      // Modify state array immutably
      let newNode2: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfStartContainer]);
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
          className: 'constitution__text--selected', 
          key: 'startSpan' + newKey,
          onClick: this.handleConstitutionSetClick
        }, 
        startContainer.textContent.substring(indexOfSelectionStart, startContainer.textContent.length)
      );
      
      // Modify state array immutably
      let firstNewNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfStartContainer]);
      firstNewNode.innerHTML = [
        startContainer.textContent.substring(0, indexOfSelectionStart),
        firstNewSpan
      ];
      
      newNodes.push(firstNewNode);

      // Create a new Span element with the contents of the highlighted text
      let firstNewSpan2: React.ReactNode = React.createElement(
        'span', 
        {
          className: 'editor__constitution--highlighted', 
          key: 'startSpan2' + newKey
        }, 
        startContainer.textContent.substring(indexOfSelectionStart, startContainer.textContent.length)
      );
      
      // Modify state array immutably
      let firstNewNode2: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfStartContainer]);
      firstNewNode2.innerHTML = [
        startContainer.textContent.substring(0, indexOfSelectionStart),
        firstNewSpan2
      ];
      
      highlightedNodes.push(firstNewNode2);

      for(let index: number = indexOfStartContainer + 1; index < indexOfEndContainer ; index++){
        let nextNewNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[index]);
        let key: string = 'middleSpan-' + index.toString();
        let nextNewSpan: React.ReactNode = React.createElement(
          'span',
          {
            className: 'constitution__text--selected', 
            key: key,
            onClick: this.handleConstitutionSetClick
          },
          nextNewNode.innerHTML
        )
        nextNewNode.innerHTML = [nextNewSpan];

        newNodes.push(nextNewNode);

        let nextNewNode2: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[index]);
        let key2: string = 'middleSpan2-' + index.toString();
        let nextNewSpan2: React.ReactNode = React.createElement(
          'span',
          {
            className: 'editor__constitution--highlighted', 
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
          className: 'constitution__text--selected', 
          key: 'endSpan' + newKey,
          onClick: this.handleConstitutionSetClick
        }, 
        endContainer.textContent.substring(0, indexOfSelectionEnd)
      );
      // Modify state array immutably
      let lastNewNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfEndContainer]);
      lastNewNode.innerHTML = [
        lastNewSpan,
        endContainer.textContent.substring(indexOfSelectionEnd, endContainer.textContent.length),
      ];

      newNodes.push(lastNewNode);
    
      // Create a new Span element with the contents of the highlighted text
      let lastNewSpan2: React.ReactNode = React.createElement(
        'span', 
        {
          className: 'editor__constitution--highlighted', 
          key: 'endSpan' + newKey
        }, 
        endContainer.textContent.substring(0, indexOfSelectionEnd)
      );
      // Modify state array immutably
      let lastNewNode2: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfEndContainer]);
      lastNewNode2.innerHTML = [
        lastNewSpan2,
        endContainer.textContent.substring(indexOfSelectionEnd, endContainer.textContent.length),
      ];

      highlightedNodes.push(lastNewNode2);
    }
    
    newConstitutionFull = [
      ...newConstitutionFull,
      ...newNodes,
      ...constitutionNodes.slice(indexOfEndContainer + 1, this.state.constitutionNodes.length)
    ]
    
    newKey = this.incrKey(newKey);
    this.setState( prevState => ({
      constitutionNodes: [...newConstitutionFull],
      textIsHighlighted: true,
      highlightedNodes: [...highlightedNodes],
      uniqueKey: newKey
    }));

    this.clearDefaultDOMSelection();
  }
  // On change, update the app's React state with the new editor state.
  handleEditorChange(editorState: SlateEditorState): void {
    this.setState({ editorState })
  }
  handleEditorKeyDown(event: KeyboardEvent, data: any, state: SlateEditorState): SlateEditorState {
    // Determine whether cursor is in title block
    const isTitle = state.blocks.some((block: SlateBlock) => block.type == 'title')
    const isConstitution = state.blocks.some((block: SlateBlock) => block.type == 'constitution')

    // If enter is pressed in title block, move cursor to beginning of next block
    if (event.which == key('Enter') && isTitle) {
      // Get the key of the first Text block after title.
      let key = state.document.nodes.rest().first().getFirstText().key;

      // Move selection (cursor) to beginning of first Text block after title.
      let cursorAfterTitle: SlateSelection = Selection.create({
        anchorKey: key,
        anchorOffset: 0,
        focusKey: key,
        focusOffset: 0,
        isBackward: false,
        isFocused: true
      });
      
      const newState = state
        .transform()
        .select(cursorAfterTitle)
        .insertBlock('paragraph')
        .apply();
      
      return newState;
    }

    if (event.which == key('Enter')) {
      const newState = state
        .transform()
        .insertBlock('paragraph')
        .apply();
      
      return newState;
    }
    
    if (event.which == key('Backspace')){
      let selection: SlateSelection = state.selection;
      if (selection.isCollapsed && selection.hasEdgeAtStartOf(state.document.nodes.rest().first())) {
        //Don't allow first paragraph to be deleted from editor. Should remain empty, but not removed from DOM
        return state;
      }
      if (selection.hasEdgeIn(state.document.nodes.rest().first()) && isConstitution) {
        if (state.document.nodes.first().getFirstText().text || state.document.nodes.size > 2) {
          //There is a title, or there is text after the constitution
          const newState = state
            .transform()
            .removeNodeByKey(state.document.nodes.rest().first().key)
            .insertBlock('paragraph')
            .apply();

          return newState;
        } else {
          //There is no title nor anything else in the take
          const newState = initialState;
          return newState;
        }
        
      }
    }

    return;
  }
  render(){
    return (
      <div>
        <TakeEditor 
          schema={this.state.schema}
          editorState={this.state.editorState}
          onChange={this.handleEditorChange}
          onKeyDown={this.handleEditorKeyDown}
        />
        <Constitution 
          onClearClick={this.handleConstitutionClearClick}
          onSetClick={this.handleConstitutionSetClick}
          onMouseUp={this.handleConstitutionMouseUp} 
          constitutionNodes={this.state.constitutionNodes}
        />
      </div>
    )
  }
}


export default MyTake;
