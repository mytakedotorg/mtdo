/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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

interface DropDownProps {
  children?: React.ReactNode;
  classModifier: string;
  customPosition?: string;
  disabled?: boolean;
  dropdownPosition: Position;
  toggleText: string | React.ReactNode;
}

type Position = "TL" | "TR" | "BL" | "BR" | "CUSTOM";

interface DropDownState {
  dropDownIsOpen: boolean;
}

class DropDown extends React.Component<DropDownProps, DropDownState> {
  private div: HTMLDivElement;
  constructor(props: DropDownProps) {
    super(props);

    this.state = {
      dropDownIsOpen: false,
    };
  }
  onMouseDown = (e: MouseEvent) => {
    const { disabled } = this.props;
    if (
      e.currentTarget &&
      (typeof disabled != "boolean" || disabled === false)
    ) {
      if (
        e.currentTarget === window &&
        !e.defaultPrevented &&
        !ancestorHasClass(e.target as HTMLElement, "dropdown")
      ) {
        // This is the default handler, window was clicked, close dropDown
        this.setState({
          dropDownIsOpen: false,
        });
        this.div.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("touchend", this.onMouseDown);
      } else if (
        (e.currentTarget as HTMLElement).classList &&
        !(e.currentTarget as HTMLElement).classList.contains("dropdown")
      ) {
        // Something outside of the dropdown was clicked, close dropDown
        this.setState({
          dropDownIsOpen: false,
        });
        this.div.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("touchend", this.onMouseDown);
      }
    }
  };
  toggleMenu = (e: React.MouseEvent<HTMLSpanElement>) => {
    const { disabled } = this.props;
    if (typeof disabled != "boolean" || disabled === false) {
      const dropDownIsOpen = this.state.dropDownIsOpen;
      if (!dropDownIsOpen) {
        this.div.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("touchend", this.onMouseDown);
      } else {
        this.div.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("touchend", this.onMouseDown);
      }
      this.setState({
        dropDownIsOpen: !dropDownIsOpen,
      });
    }
  };
  componentWillUnmount() {
    this.div.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("touchend", this.onMouseDown);
  }
  render() {
    let dropDownClassModifier;
    if (!this.state.dropDownIsOpen || this.props.disabled === true) {
      dropDownClassModifier = "hidden";
    } else {
      switch (this.props.dropdownPosition) {
        case "TL":
          dropDownClassModifier = "tl";
          break;
        case "TR":
          dropDownClassModifier = "tr";
          break;
        case "BL":
          dropDownClassModifier = "bl";
          break;
        case "BR":
          dropDownClassModifier = "br";
          break;
        case "CUSTOM":
          dropDownClassModifier = this.props.classModifier;
          break;
        default:
          throw "DropDown: Unknown position.";
      }
    }

    return (
      <div
        className={"dropdown dropdown--" + this.props.classModifier}
        ref={(div: HTMLDivElement) => (this.div = div)}
      >
        <button
          className={
            "dropdown__toggle dropdown__toggle--" + this.props.classModifier
          }
          onClick={this.toggleMenu}
        >
          {this.props.toggleText}
        </button>
        <div
          className={
            "dropdown__dropdown dropdown__dropdown--" + dropDownClassModifier
          }
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

function ancestorHasClass(
  element: HTMLElement | null,
  classname: string
): boolean {
  if (element) {
    if (element.classList.contains(classname)) {
      return true;
    }
    return ancestorHasClass(element.parentElement, classname);
  } else {
    return false;
  }
}

export default DropDown;
