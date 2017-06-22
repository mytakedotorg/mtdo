import * as React from "react";
import * as ReactDOM from "react-dom";
import config from "./config";
import getNodeArray from "../../utils/getNodeArray";
const constitutionText = require('./constitution.foundation.html');

class Constitution extends React.Component<ConstitutionProps, ConstitutionState> {
  constructor(props: ConstitutionProps){
    super(props);

    this.state = {
      constitutionStructure: config.constitution,
      constitutionNodes: this.getInitialText(),
      textIsHighlighted: false
    }
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
  }
  clearSelection() {
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else { 
      // pre IE 9
    }
  }
  getInitialText(): Array<MyReactComponentObject> {
    const initialText = getNodeArray(constitutionText);
    return initialText;
  }
  highlightText(range: Range): any {
    let indexOfStartContainer: number = Array.prototype.indexOf.call(
      range.startContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
      range.startContainer.parentNode);                         //Find indexOf current Node
    
    let indexOfSelectionStart: number = range.startOffset;

    let indexOfEndContainer: number = Array.prototype.indexOf.call(
      range.endContainer.parentElement.parentNode.childNodes, //Arrange siblings into an array
      range.endContainer.parentNode);                        //Find indexOf current Node

    let indexOfSelectionEnd: number = range.endOffset;

    let startContainer: Node = ReactDOM.findDOMNode(this).childNodes[1].childNodes[indexOfStartContainer];
    let endContainer: Node = ReactDOM.findDOMNode(this).childNodes[1].childNodes[indexOfEndContainer];
    
    if (startContainer === endContainer) {
      // Create a new Span element with the contents of the highlighted text
      let newSpan: React.ReactNode = React.createElement(
        'span', 
        {className: 'constitution__text--selected', key: 'startSpan'}, 
        startContainer.textContent.substring(indexOfSelectionStart, indexOfSelectionEnd)
      );

      // Modify state array immutably
      let newNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfStartContainer]);
      newNode.innerHTML = [
        startContainer.textContent.substring(0, indexOfSelectionStart),
        newSpan,
        startContainer.textContent.substring(indexOfSelectionEnd, startContainer.textContent.length)
      ];

      this.setState( prevState => ({
        constitutionNodes: [
          ...prevState.constitutionNodes.slice(0, indexOfStartContainer),
          newNode, 
          ...prevState.constitutionNodes.slice(indexOfEndContainer + 1, this.state.constitutionNodes.length)
        ],
        textIsHighlighted: true
      }));
    } else {
      // Create a new Span element with the contents of the highlighted text
      let firstNewSpan: React.ReactNode = React.createElement(
        'span', 
        {className: 'constitution__text--selected', key: 'startSpan'}, 
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
        {className: 'constitution__text--selected', key: 'endSpan'}, 
        endContainer.textContent.substring(0, indexOfSelectionEnd)
      );
      // Modify state array immutably
      let lastNewNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[indexOfEndContainer]);
      lastNewNode.innerHTML = [
        lastNewSpan,
        endContainer.textContent.substring(indexOfSelectionEnd, endContainer.textContent.length),
      ];

      let newNodes: Array<MyReactComponentObject> = [];
      newNodes.push(firstNewNode);

      for(let index: number = indexOfStartContainer + 1; index < indexOfEndContainer ; index++){
        console.log('in for loop now');
        let nextNewNode: MyReactComponentObject = (Object as any).assign({}, this.state.constitutionNodes[index]);
        let key: string = 'middleSpan-' + index.toString();
        let nextNewSpan: React.ReactNode = React.createElement(
          'span',
          {className: 'constitution__text--selected', key: key},
          nextNewNode.innerHTML
        )
        nextNewNode.innerHTML = [nextNewSpan];

        newNodes.push(nextNewNode);
      }
      newNodes.push(lastNewNode);
      this.setState( prevState => ({
        constitutionNodes: [
          ...prevState.constitutionNodes.slice(0, indexOfStartContainer),
          ...newNodes, 
          ...prevState.constitutionNodes.slice(indexOfEndContainer + 1, this.state.constitutionNodes.length)
        ],
        textIsHighlighted: true
      }));
    }
    this.clearSelection();
  }
  handleMouseUp(ev: React.MouseEvent<HTMLDivElement>): void {
    if (window.getSelection) { // Pre IE9 will always be false
      let selection: Selection = window.getSelection();
      if (selection.toString().length) {  //Some text is selected
        let range: Range = selection.getRangeAt(0);
        this.setState({
          constitutionNodes: this.getInitialText()  //Clear existing highlights
        }, ()=>{this.highlightText(range)});
      }
    }    
  }
  handleDragStart(ev: React.DragEvent<HTMLDivElement>): void{
    try {
      // ev.dataTransfer.setData('text', DATA_TO_SEND);
    } catch(err){ console.error(err)}
  }
  render(){
      /**
       * Might use this later
       */
      // <ul className="constitution__sections">
      // {Object.keys(this.state.constitutionStructure).map(function(key: string, index: number){
      //   return (<li id={key} key={index} className="constitution__section">{key}</li>);
      // })}
      // </ul>
    return (
      <div className="constitution">
        <h2 className="constitution__heading">Constitution</h2>
        <div className="constitution__text" onMouseUp={this.handleMouseUp}>
          {this.state.constitutionNodes.map(function(element: MyReactComponentObject, index: number){
            element.props['key'] = index.toString();
            return(
              React.createElement(element.component, element.props, element.innerHTML)
            );
          })}
        </div>
      </div>
    )
  }
}


export default Constitution;
