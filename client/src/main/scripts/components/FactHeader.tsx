import * as React from "react";
import DropDown from "./DropDown";
import QuickShare from "./QuickShare";

interface FactHeaderProps {
  heading: string;
}

interface FactHeaderState {}

class FactHeader extends React.Component<FactHeaderProps, FactHeaderState> {
  private header: HTMLDivElement;
  static headerHeight = 118;
  constructor(props: FactHeaderProps) {
    super(props);
  }
  render() {
    return (
      <div className="document__header document__header--visible">
        <div>
          <h2 className={"document__heading"}>{this.props.heading}</h2>
          <div className="document__header-actions">
            <p className="document__instructions">
              Highlight captions to create a video clip
            </p>
          </div>
        </div>
      </div>
    );
  }
}

interface StickyFactHeaderProps {
  heading: string;
  highlightedRange: [number, number];
  factHash: string;
  onClearClick: () => void;
  onSetClick: () => void;
  textIsHighlighted: boolean;
  isDocument: boolean;
  viewRange: [number, number];
}

interface StickyFactHeaderState {
  isFixed: boolean;
}

export class StickyFactHeader extends React.Component<
  StickyFactHeaderProps,
  StickyFactHeaderState
> {
  private header: HTMLDivElement;
  private offsetTop: number;
  private marginTop = 13;
  constructor(props: StickyFactHeaderProps) {
    super(props);
    this.state = {
      isFixed: false
    };
  }
  handleClearClick = () => {
    this.props.onClearClick();
  };
  handleSetClick = () => {
    this.props.onSetClick();
  };
  handleResize = () => {
    this.calculateOffset();
  };
  handleScroll = () => {
    if (window.pageYOffset > this.offsetTop) {
      this.setState({
        isFixed: true
      });
    } else {
      this.setState({
        isFixed: false
      });
    }
  };
  calculateOffset = () => {
    const rect = this.header.getBoundingClientRect();
    this.offsetTop = rect.top + window.pageYOffset - this.marginTop;
  };
  componentDidMount() {
    this.calculateOffset();
    window.addEventListener("scroll", this.handleScroll);
    window.addEventListener("resize", this.handleResize);
  }
  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
    window.removeEventListener("resize", this.handleResize);
  }
  render() {
    let headerClass = "document__header";
    if (this.state.isFixed) {
      headerClass += " document__header--fixed";
    } else {
      headerClass += " document__header--scroll";
    }

    return (
      <div
        className={headerClass}
        ref={(header: HTMLDivElement) => (this.header = header)}
      >
        <h2 className={"document__heading"}>{this.props.heading}</h2>
        <div className="document__header-actions">
          {this.props.textIsHighlighted ? (
            <span
              className="document__button document__button--blue"
              onClick={this.handleClearClick}
            >
              Clear Selection
            </span>
          ) : (
            <p className="document__instructions">
              {this.props.isDocument
                ? "Highlight something to give your Take"
                : "Highlight captions to create a video clip"}
            </p>
          )}
          {this.props.textIsHighlighted ? (
            <DropDown
              classModifier="docShare"
              dropdownPosition="CUSTOM"
              toggleText="Share"
            >
              <QuickShare
                highlightedRange={this.props.highlightedRange}
                onSendToTake={this.handleSetClick}
                videoIdHash={this.props.factHash}
                viewRange={this.props.viewRange}
              />
            </DropDown>
          ) : null}
        </div>
      </div>
    );
  }
}

export default FactHeader;
