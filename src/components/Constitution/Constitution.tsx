import * as React from "react";

class Constitution extends React.Component<ConstitutionProps, ConstitutionState> {
  constructor(props: ConstitutionProps){
    super(props);
  }

  render(){
    return (
      <div className="constitution">
        <h2 className="constitution__heading">Constitution</h2>
        <button onClick={this.props.onClick}>
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
