import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationTextTypes, FoundationNode } from "../Foundation";
import { getNodeArray, highlightText, HighlightedText } from "../../utils/functions";

interface AmendmentsProps {
  onBackClick: () => void;
  onSetClick: (type: FoundationTextTypes, range: [number, number]) => void;
}

interface AmendmentsState {
  amendmentsNodes: FoundationNode[];
  range: [number, number];
  textIsHighlighted: boolean;
}

class Amendments extends React.Component<AmendmentsProps, AmendmentsState> {
  constructor(props: AmendmentsProps) {
    super(props);

    this.state = {
      amendmentsNodes: getNodeArray('AMENDMENTS'),
      range: [0, 0],
      textIsHighlighted: false
    };
  }
  handleClearClick = () => {
    this.setState({
      amendmentsNodes: getNodeArray('AMENDMENTS'), //Clear existing highlights
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
          [...this.state.amendmentsNodes],
          "AMENDMENTS",
          ReactDOM.findDOMNode(this).childNodes,
          this.handleSetClick
        );

        this.setState({
          amendmentsNodes: highlightedText.newNodes,
          range: highlightedText.range,
          textIsHighlighted: true
        });
      }
    }
  };
  handleSetClick = () => {
    this.props.onSetClick("AMENDMENTS", this.state.range);
  };
  render() {
    return (
      <div className="amendments">
        <h2 className="amendments__heading">Amendments to the Constitution</h2>
        <p className="constitution__instructions">
          {this.state.textIsHighlighted
            ? "Click your selection to send it to the Take."
            : "Highlight some text from the Amendments below."}
        </p>
        <button onClick={this.props.onBackClick}>Back to Foundation</button>
        <button onClick={this.handleClearClick}>Clear Selection</button>
        <div className="amendments__row">
          <div className="amendments__sections">
            <p>
              &lt;This is just a placeholder block for section links to
              autoscroll to particular parts of the amendments&gt;
            </p>
          </div>
          <div className="amendments__text" onMouseUp={this.handleMouseUp}>
            {this.state.amendmentsNodes.map(function(
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

export default Amendments;
