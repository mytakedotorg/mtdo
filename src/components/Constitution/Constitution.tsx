import * as React from "react";

class Constitution extends React.Component<ConstitutionProps, void> {
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
        <button onClick={this.props.onBackClick}>
          Back to Foundation
        </button>
        <button onClick={this.props.onClearClick}>
          Clear Selection
        </button>
        <div className="constitution__row">
          <div className="constitution__sections">
            <p>&lt;This is just a placeholder block for section links to autoscroll to particular parts of the constitution&gt;</p>
          </div>
          <div className="constitution__text" onMouseUp={this.props.onMouseUp}>
            {this.props.constitutionNodes.map(function(element: MyReactComponentObject, index: number){
              element.props['key'] = index.toString();
              return(
                React.createElement(element.component, element.props, element.innerHTML)
              );
            })}
          </div>
        </div>
      </div>
    )
  }
}


export default Constitution;
