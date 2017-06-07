import * as React from "react";
import config from "./config";
const constitutionText = require('./constitution.html');

class Constitution extends React.Component<ConstitutionProps, ConstitutionState> {
  constructor(props: ConstitutionProps){
    super(props);
    this.state = {
      constitutionStructure: config.constitution,
      constitutionText: constitutionText
    }
    this.onDragStart = this.onDragStart.bind(this);
  }
  getIndices(range: Range): rangeData {
    let docStartOffset: number;
    let startClass: string;
    let startsInChild: boolean = false;
    let endsInChild: boolean = false;
    if(!range.startContainer.parentElement.className) {
      startClass = range.startContainer.parentElement.parentElement.className;
      startsInChild = true;
    } else {
      startClass = range.startContainer.parentElement.className;
    }
    let endClass: string;
    if(!range.endContainer.parentElement.className) {
      endClass = range.endContainer.parentElement.parentElement.className;
      endsInChild = true;
    } else {
      endClass = range.endContainer.parentElement.className;
    }
    switch(startClass){
      case '1': 
        if(startsInChild){
          if(range.startOffset === 0) {
            docStartOffset = config.constitution.preamble.start;
          } else {
            //Offset includes opening html tags
            docStartOffset = 21 + range.startOffset + config.constitution.preamble.start;
          }
        } else {
          //Offset includes html tags up to this point
          docStartOffset = 30 + range.startOffset + config.constitution.preamble.start;
        }
        break;
      default:
        throw 'Unknown selection';
    }
    let docEndOffset;
    switch(endClass){
      case '1': 
        docEndOffset = config.constitution.preamble.start;
        if(endsInChild) {
          docEndOffset = config.constitution.preamble.start + 21 + range.endOffset;
        } else {
          docEndOffset = config.constitution.preamble.start + 43 + range.endOffset;
        }
        break;
      default:
        throw 'Unknown selection';
    }
    const start = docStartOffset;
    const end = docEndOffset;
    return { start, end }; 
  }
  fixHTML(html: string): string{
    var div = document.createElement('div');
    div.innerHTML=html
    return (div.innerHTML);
  }
  onDragStart(ev: React.DragEvent<HTMLLIElement>): void{
    if (window.getSelection) { // Pre IE9 will always be false
      let selection: Selection = window.getSelection();
      let range: Range = selection.getRangeAt(0);
      
      try {
        let {start, end }: rangeData = this.getIndices(range);
        let excerpt = this.state.constitutionText.substring(start, end);
        excerpt = this.fixHTML(excerpt);
        ev.dataTransfer.setData('text', excerpt);
      } catch(err){ console.error(err)}
    }
  }
  createMarkup(){
    return {__html: this.state.constitutionText};
  }
  render(){
    let that: any = this;
    return (
      <div className="constitution">
        <h2 className="constitution__heading">Constitution</h2>
        <ul className="constitution__sections">
        {Object.keys(this.state.constitutionStructure).map(function(key: string, index: number){
          return (<li id={key} key={index} className="constitution__section">{key}</li>);
        })}
        </ul>
        <div className="constitution__text" dangerouslySetInnerHTML={this.createMarkup()} onDragStart={that.onDragStart} >
        </div>
      </div>
    )
  }
}


export default Constitution;
