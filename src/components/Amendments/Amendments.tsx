import * as React from "react";
import { FoundationNode } from '../Foundation';

interface AmendmentsProps {
  amendmentsNodes: Array<FoundationNode>,
  textIsHighlighted: boolean,
  onBackClick: () => void,
  onClearClick: () => void,
  onSetClick: () => void,
  onMouseUp: () => void
}

class Amendments extends React.Component<AmendmentsProps, void> {
  constructor(props: AmendmentsProps){
    super(props);
  }

  render(){
    return (
      <div className="amendments">
        <h2 className="amendments__heading">Amendments to the Constitution</h2>
        <p className="constitution__instructions">{ this.props.textIsHighlighted ? 
          'Click your selection to send it to the Take.'
          : 'Highlight some text from the Amendments below.'}</p>
        <button onClick={this.props.onBackClick}>
          Back to Foundation
        </button>
        <button onClick={this.props.onClearClick}>
          Clear Selection
        </button>
        <div className="amendments__row">
          <div className="amendments__sections">
            <p>&lt;This is just a placeholder block for section links to autoscroll to particular parts of the amendments&gt;</p>
          </div>
          <div className="amendments__text" onMouseUp={this.props.onMouseUp}>
            {this.props.amendmentsNodes.map(function(element: FoundationNode, index: number){
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


export default Amendments;
