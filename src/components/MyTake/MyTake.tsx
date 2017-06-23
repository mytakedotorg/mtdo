import * as React from "react";
import * as ReactDOM from "react-dom";
import TakeEditor, { TitleNode, ParagraphNode} from '../TakeEditor';
import Constitution from '../Constitution';
const { Raw } = require('slate');
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
      dragData: '',
      editorState: initialState,
      schema: {
        nodes: {
          title: TitleNode,
          paragraph: ParagraphNode,
        }
      }
    }

    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleConstitutionMouseUp = this.handleConstitutionMouseUp.bind(this);
    this.handleConstitutionClick = this.handleConstitutionClick.bind(this);
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
  handleConstitutionClick(): void {
    this.setState({
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
  handleDragStart(ev: React.DragEvent<HTMLDivElement>): void{
    try {
      //Use ev.dataTransfer.setDragImage for multi-span selections
      ev.dataTransfer.setData('text', JSON.stringify(this.state.dragData));
    } catch(err){ console.error(err)}
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

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~|~~~~~~~~~~~~~|
    //Need to find a way not to hardcode these indices ----------------v-------------v
    const startContainer: Node = ReactDOM.findDOMNode(this).childNodes[0].childNodes[2].childNodes[indexOfStartContainer];
    const endContainer: Node = ReactDOM.findDOMNode(this).childNodes[0].childNodes[2].childNodes[indexOfEndContainer];
    
    const startOffset: number = parseInt(
        startContainer
          .parentElement
          .children[indexOfStartContainer]
          .getAttribute('data-offset')
      ) + range.startOffset;

    const endOffset: number = parseInt(
        endContainer
          .parentElement
          .children[indexOfEndContainer]
          .getAttribute('data-offset')
      ) + range.endOffset;

    const dragData = {
      startOffset: startOffset,
      endOffset: endOffset
    }

    const { constitutionNodes } = this.state; 
    let newNodes: Array<MyReactComponentObject> = [...constitutionNodes.slice(0, indexOfStartContainer)];

    if (startContainer === endContainer) {
      // Create a new Span element with the contents of the highlighted text
      let newSpan: React.ReactNode = React.createElement(
        'span', 
        {
          className: 'constitution__text--selected', 
          key: 'startSpan',
          draggable: 'true',
//          onDragStart: this.handleDragStart
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

    } else {
      // Create a new Span element with the contents of the highlighted text
      let firstNewSpan: React.ReactNode = React.createElement(
        'span', 
        {
          className: 'constitution__text--selected', 
          key: 'startSpan',
          draggable: 'true',
//          onDragStart: this.handleDragStart
        }, 
        startContainer.textContent.substring(indexOfSelectionStart, startContainer.textContent.length)
      );
      
      // Modify state array immutably
      let firstNewNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfStartContainer]);
      firstNewNode.innerHTML = [
        startContainer.textContent.substring(0, indexOfSelectionStart),
        firstNewSpan
      ];
      
      // Create a new Span element with the contents of the highlighted text
      let lastNewSpan: React.ReactNode = React.createElement(
        'span', 
        {
          className: 'constitution__text--selected', 
          key: 'endSpan',
          draggable: 'true',
//          onDragStart: this.handleDragStart
        }, 
        endContainer.textContent.substring(0, indexOfSelectionEnd)
      );
      // Modify state array immutably
      let lastNewNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfEndContainer]);
      lastNewNode.innerHTML = [
        lastNewSpan,
        endContainer.textContent.substring(indexOfSelectionEnd, endContainer.textContent.length),
      ];

      newNodes.push(firstNewNode);

      for(let index: number = indexOfStartContainer + 1; index < indexOfEndContainer ; index++){
        let nextNewNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[index]);
        let key: string = 'middleSpan-' + index.toString();
        let nextNewSpan: React.ReactNode = React.createElement(
          'span',
          {
            className: 'constitution__text--selected', 
            key: key,
            draggable: 'true',
//            onDragStart: this.handleDragStart
          },
          nextNewNode.innerHTML
        )
        nextNewNode.innerHTML = [nextNewSpan];

        newNodes.push(nextNewNode);
      }
      newNodes.push(lastNewNode);
    }
    newNodes = [
      ...newNodes,
      ...constitutionNodes.slice(indexOfEndContainer + 1, this.state.constitutionNodes.length)
    ]
    this.setState( prevState => ({
      constitutionNodes: [...newNodes],
      textIsHighlighted: true,
      dragData: dragData
    }));

    this.clearDefaultDOMSelection();
  }
  // On change, update the app's React state with the new editor state.
  handleEditorChange(editorState: TakeEditorOnChange): void {
    this.setState({ editorState })
  }
  handleEditorKeyDown(event: KeyboardEvent, data: any, state: any): any{
    // Determine whether cursor is in title block
    const isTitle = state.blocks.some((block: any) => block.type == 'title')
    
    // If enter is pressed in title block, move cursor to beginning of next block
    if (event.which == key('Enter') && isTitle) {
      let selection: any = {
        anchorKey: "2",
        anchorOffset: 0,
        focusKey: "2",
        focusOffset: 0
      }
      const newState = state
        .transform()
        .select(selection)
        .apply();
      
      return newState;
    }

    return;
  }
  render(){
    return (
      <div>
        <Constitution 
          onClick={this.handleConstitutionClick} 
          onMouseUp={this.handleConstitutionMouseUp} 
          constitutionNodes={this.state.constitutionNodes} 
        />
        <TakeEditor 
          schema={this.state.schema}
          editorState={this.state.editorState}
          onChange={this.handleEditorChange}
          onKeyDown={this.handleEditorKeyDown}
        />
      </div>
    )
  }
}


export default MyTake;
