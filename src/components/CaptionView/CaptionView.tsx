import * as React from "react";
import * as ReactDOM from "react-dom";
import Document from "../Document";
import {
  getHighlightedNodes,
  getNodeArray,
  getStartRangeOffsetTop,
  highlightText,
  HighlightedText,
  FoundationNode
} from "../../utils/functions";

interface Ranges {
  highlightedRange: [number, number];
  viewRange: [number, number];
}

interface CaptionViewProps {
  videoId: string;
  timer: number;
  ranges?: Ranges;
  onHighlight: (videoRange: [number, number]) => void;
  onClearPress: () => void;
  captionIsHighlighted: boolean;
}

interface CaptionViewState {
  highlightedRange: [number, number];
  viewRange: [number, number];
  highlightedNodes: FoundationNode[];
  currentIndex: number;
  offsetTop: number;
}

class CaptionView extends React.Component<CaptionViewProps, CaptionViewState> {
  private document: Document;
  constructor(props: CaptionViewProps) {
    super(props);
    this.state = {
      highlightedRange: props.ranges ? props.ranges.highlightedRange : [0, 0],
      viewRange: props.ranges ? props.ranges.viewRange : [0, 0],
      highlightedNodes: getNodeArray(props.videoId),
      currentIndex: 0,
      offsetTop: 0
    };
  }
  handleClearClick = () => {
    this.setState({
      highlightedNodes: getNodeArray(this.props.videoId)
    });
    this.props.onClearPress();
  };
  handleMouseUp = () => {
    if (window.getSelection && !this.props.captionIsHighlighted) {
      // Pre IE9 will always be false
      let selection: Selection = window.getSelection();
      if (selection.toString().length) {
        // Some text is selected
        let range: Range = selection.getRangeAt(0);

        const highlightedText: HighlightedText = highlightText(
          range, // HTML Range, not [number, number] as in props.range
          this.document.getDocumentNodes(),
          ReactDOM.findDOMNode(this.document).childNodes,
          () => {} // noop
        );

        this.setState({
          highlightedNodes: highlightedText.newNodes,
          highlightedRange: highlightedText.highlightedRange
        });

        this.props.onHighlight(highlightedText.videoRange);
      }
    }
  };
  render() {
    return (
      <div className="captions">
        {this.props.captionIsHighlighted
          ? <div className="video__actions">
              <div className="video__action">
								<p className="video__instructions">
                	Press Play to see your clip
              	</p>
                <button
                  className="video__button video__button--bottom"
                  onClick={this.handleClearClick}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          : null}
        <Document
          excerptId={this.props.videoId}
          onMouseUp={this.handleMouseUp}
          ref={(document: Document) => (this.document = document)}
          className="document__row"
          captionTimer={this.props.timer}
          nodes={this.state.highlightedNodes}
        />
      </div>
    );
  }
}

export default CaptionView;
