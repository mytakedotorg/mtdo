import * as React from "react";

class Constitution extends React.Component<ConstitutionProps, ConstitutionState> {
  constructor(props: ConstitutionProps){
    super(props);
  }

  render(){
    return (
      <div className="constitution">
        <h2 className="constitution__heading">Constitution for the United States of America</h2>
        <p className="constitution__instructions">{ this.props.textIsHighlighted ? 
          'Click your selection to send it to the Take.'
          : 'Highlight some text from the Constitution below.'}</p>
        <button onClick={this.props.onClearClick}>
          Clear Selection
        </button>
        <div className="constitution__text" onMouseUp={this.props.onMouseUp}>
          {this.props.constitutionNodes.map(function(element: MyReactComponentObject, index: number){
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
