import * as React from "react";
import * as ReactDOM from "react-dom";
import { getNodeArray, FoundationNode } from "../../utils/functions";

interface FactHeaderProps {
  heading: string;
  isFixed: boolean;
  onClearClick: () => void;
  onSetClick: () => void;
  onScroll: (headerHidden: boolean) => void;
  textIsHighlighted: boolean;
  isDocument: boolean;
}

interface FactHeaderState {}

class FactHeader extends React.Component<FactHeaderProps, FactHeaderState> {
  private header: HTMLDivElement;
  static headerHeight = 118;
  constructor(props: FactHeaderProps) {
    super(props);
  }
  handleClearClick = () => {
    this.props.onClearClick();
  };
  handleSetClick = () => {
    this.props.onSetClick();
  };
  handleScroll = () => {
    this.props.onScroll(this.header.getBoundingClientRect().top <= 0);
  };
  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }
  render() {
    let scrollingHeaderClass = "document__header";
    let fixedHeaderClass = "document__header";
    if (this.props.isFixed) {
      scrollingHeaderClass += " document__header--hidden";
      fixedHeaderClass += " document__header--fixed";
    } else {
      scrollingHeaderClass += " document__header--visible";
      fixedHeaderClass += " document__header--hidden";
    }

    const headerContent = (
      <div>
        <h2 className={"document__heading"}>
          {this.props.heading}
        </h2>
        <div className="document__header-actions">
          {this.props.textIsHighlighted
            ? <button
                className="document__button document__button--blue"
                onClick={this.handleClearClick}
              >
                Clear Selection
              </button>
            : <p className="document__instructions">
                {this.props.isDocument
                  ? "Highlight something to give your Take"
                  : "Pause the video to set your start and end times"}
              </p>}
          {this.props.textIsHighlighted
            ? <button
                className="document__button document__button--red"
                onClick={this.handleSetClick}
              >
                Give your Take on this
              </button>
            : null}
        </div>
      </div>
    );

    return (
      <div ref={(header: HTMLDivElement) => (this.header = header)}>
        <div className={scrollingHeaderClass}>
          {headerContent}
        </div>
        <div className={fixedHeaderClass}>
          {headerContent}
        </div>
      </div>
    );
  }
}

export default FactHeader;
