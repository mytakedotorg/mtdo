import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationTextTypes, FoundationNode } from "../Foundation";
import { getNodeArray, highlightText, HighlightedText } from "../../utils/functions";
const constitutionText = require("../../foundation/constitution.foundation.html");

interface ConstitutionProps {
  onBackClick: () => void;
  onSetClick: (type: FoundationTextTypes, range: [number, number]) => void;
}

interface ConstitutionState {
  constitutionNodes: FoundationNode[];
  range: [number, number];
  textIsHighlighted: boolean;
}

class Constitution extends React.Component<
  ConstitutionProps,
  ConstitutionState
> {
  constructor(props: ConstitutionProps) {
    super(props);

    this.state = {
      constitutionNodes: getNodeArray('CONSTITUTION'),
      range: [0, 0],
      textIsHighlighted: false
    };
  }
  handleClearClick = () => {
    this.setState({
      constitutionNodes: getNodeArray('CONSTITUTION'), //Clear existing highlights
      textIsHighlighted: false
    });
  };
  handleMouseUp = () => {
    if (window.getSelection && !this.state.textIsHighlighted) {
      // Pre IE9 will always be false
      let selection: Selection = window.getSelection();
      if (selection.toString().length) {
        //Some text is selected
        let range: Range = selection.getRangeAt(0);

        const highlightedText: HighlightedText = highlightText(
          range,
          [...this.state.constitutionNodes],
          "CONSTITUTION",
          ReactDOM.findDOMNode(this).childNodes,
          this.handleSetClick
        );

        this.setState({
          constitutionNodes: highlightedText.newNodes,
          range: highlightedText.range,
          textIsHighlighted: true
        });
      }
    }
  };
  handleSetClick = () => {
    this.props.onSetClick("CONSTITUTION", this.state.range);
  };
  render() {
    return (
      <div className="constitution">
        <h2 className="constitution__heading">
          Constitution for the United States of America
        </h2>
        <p className="constitution__instructions">
          {this.state.textIsHighlighted
            ? "Click your selection to send it to the Take."
            : "Highlight some text from the Constitution below."}
        </p>
        <button onClick={this.props.onBackClick}>Back to Foundation</button>
        <button onClick={this.handleClearClick}>Clear Selection</button>
        <div className="constitution__row">
          <div className="constitution__sections">
            <p>
              &lt;This is just a placeholder block for section links to
              autoscroll to particular parts of the constitution&gt;
            </p>
          </div>
          <div className="constitution__text" onMouseUp={this.handleMouseUp}>
            {this.state.constitutionNodes.map(function(
              element: FoundationNode,
              index: number
            ) {
              element.props["key"] = index.toString();
              return React.createElement(
                element.component,
                element.props,
                element.innerHTML
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Constitution;
