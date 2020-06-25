/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
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
                isDocument={true}
                onSendToTake={this.handleSetClick}
                factHash={this.props.factHash}
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
