import * as React from "react";
import * as ReactDOM from "react-dom";
import { alertErr } from "../utils/functions";

interface DropDownProps {
  children?: React.ReactNode;
  text: string;
  position: Position;
}

type Position = "TL" | "TR" | "BL" | "BR";

interface DropDownState {
  dropDownIsOpen: boolean;
}

class DropDown extends React.Component<DropDownProps, DropDownState> {
  private div: HTMLDivElement;
  constructor(props: DropDownProps) {
    super(props);

    this.state = {
      dropDownIsOpen: false
    };
  }
  onMouseDown = (e: MouseEvent) => {
    if (e.currentTarget) {
      if (e.currentTarget === window && !e.defaultPrevented) {
        // This is the default handler, window was clicked, close dropDown
        this.setState({
          dropDownIsOpen: false
        });
        this.div.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousedown", this.onMouseDown);
      } else if (
        (e.currentTarget as HTMLElement).classList &&
        !(e.currentTarget as HTMLElement).classList.contains("share")
      ) {
        // Something else was clicked, close dropDown
        this.setState({
          dropDownIsOpen: false
        });
        this.div.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousedown", this.onMouseDown);
      } else {
        // Something inside the share container was clicked, prevent default
        e.preventDefault();
      }
    }
  };
  toggleMenu = () => {
    const dropDownIsOpen = this.state.dropDownIsOpen;
    if (!dropDownIsOpen) {
      this.div.addEventListener("mousedown", this.onMouseDown);
      window.addEventListener("mousedown", this.onMouseDown);
    } else {
      this.div.removeEventListener("mousedown", this.onMouseDown);
      window.removeEventListener("mousedown", this.onMouseDown);
    }
    this.setState({
      dropDownIsOpen: !dropDownIsOpen
    });
  };
  componentWillUnmount() {
    this.div.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousedown", this.onMouseDown);
  }
  render() {
    let dropDownClassModifier;
    if (!this.state.dropDownIsOpen) {
      dropDownClassModifier = "share__dropDown--hidden";
    } else {
      switch (this.props.position) {
        case "TL":
          dropDownClassModifier = "share__dropDown--tl";
          break;
        case "TR":
          dropDownClassModifier = "share__dropDown--tr";
          break;
        case "BL":
          dropDownClassModifier = "share__dropDown--bl";
          break;
        case "BR":
          dropDownClassModifier = "share__dropDown--br";
          break;
        default:
          const msg = "DropDown: Unknown position.";
          alertErr(msg);
          throw msg;
      }
    }

    return (
      <div className="share" ref={(div: HTMLDivElement) => (this.div = div)}>
        <div className="share__inner-container">
          <button
            className="share__action share__action--toggle"
            onClick={this.toggleMenu}
          >
            {this.props.text}
          </button>
          <div className={"share__dropDown " + dropDownClassModifier}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export default DropDown;
