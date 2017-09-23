import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode } from "../Foundation";
import { getNodeArray } from "../../utils/functions";

interface FactHeaderProps {
  heading: string;
  className: string;
  onClearClick: () => void;
  onScroll: (headerHidden: boolean) => void;
  textIsHighlighted: boolean;
}

interface FactHeaderState {}

class FactHeader extends React.Component<
FactHeaderProps,
  FactHeaderState
> {
  private header: HTMLDivElement;
  static headerHeight = 219;
  constructor(props: FactHeaderProps) {
    super(props);
  }
  handleClearClick = () => {
    this.props.onClearClick();
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
    const headerContent = (
      <div>
        <h2 className={"document__heading"}>
          {this.props.heading}
        </h2>
        {this.props.textIsHighlighted
          ? <button
              className="document__button"
              onClick={this.handleClearClick}
            >
              Clear Selection
            </button>
          : null}
      </div>
    );

    return (
      <div ref={(header: HTMLDivElement) => (this.header = header)}>
        <div className={this.props.className}>
          {headerContent}
        </div>
        <div className={"document__header document__header--fixed"}>
          {headerContent}
        </div>
      </div>
    );
  }
}

export default FactHeader;
