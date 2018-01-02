import * as React from "react";
import * as ReactDOM from "react-dom";
import { TakeDocument } from "./BlockEditor";
import { sendEmail } from "../utils/databaseAPI";

interface ShareContainerProps {
  takeDocument: TakeDocument;
}

interface ShareContainerState {
  emailAddress: string;
  ccSelf: boolean;
  emailHTML: {
    __html: string;
  };
  modalIsOpen: boolean;
}

class ShareContainer extends React.Component<
  ShareContainerProps,
  ShareContainerState
> {
  private div: HTMLDivElement;
  constructor(props: ShareContainerProps) {
    super(props);

    this.state = {
      emailAddress: "",
      ccSelf: false,
      emailHTML: {
        __html: ""
      },
      modalIsOpen: false
    };
  }
  handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      ccSelf: event.target.checked
    });
  };
  handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      emailAddress: event.target.value
    });
  };
  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    sendEmail(
      (Object as any).assign({}, this.props.takeDocument),
      (htmlStr: string) => {
        const emailHTML = {
          __html: htmlStr
        };

        this.setState({
          emailHTML: emailHTML
        });
      }
    );
    event.preventDefault();
  };
  toggleMenu = () => {
    const modalIsOpen = this.state.modalIsOpen;
    if (!modalIsOpen) {
      this.div.addEventListener("mousedown", this.onMouseDown);
      window.addEventListener("mousedown", this.onMouseDown);
    } else {
      this.div.removeEventListener("mousedown", this.onMouseDown);
      window.removeEventListener("mousedown", this.onMouseDown);
    }
    this.setState({
      modalIsOpen: !modalIsOpen
    });
  };
  onMouseDown = (e: MouseEvent) => {
    if (e.currentTarget) {
      if (
        e.currentTarget === window &&
        (e.target as HTMLElement).classList &&
        !(e.target as HTMLElement).classList.contains("share__input") &&
        !e.defaultPrevented
      ) {
        // This is the default handler, window was clicked, close modal
        this.setState({
          modalIsOpen: false
        });
        this.div.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousedown", this.onMouseDown);
      } else if (
        (e.currentTarget as HTMLElement).classList &&
        !(e.currentTarget as HTMLElement).classList.contains("share")
      ) {
        // Something else was clicked, close modal
        this.setState({
          modalIsOpen: false
        });
        this.div.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mousedown", this.onMouseDown);
      } else if (
        (e.target as HTMLElement).classList &&
        (e.target as HTMLElement).classList.contains("share__input")
      ) {
        // Do nothing, allow change event to fire
      } else {
        // Something inside the share container was clicked, prevent default
        e.preventDefault();
      }
    }
  };
  componentWillUnmount() {
    this.div.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousedown", this.onMouseDown);
  }
  render() {
    let modalClassModifier;
    if (!this.state.modalIsOpen) {
      modalClassModifier = "share__modal--hidden";
    } else {
      modalClassModifier = "";
    }

    return (
      <div className="share" ref={(div: HTMLDivElement) => (this.div = div)}>
        <div className="share__inner-container">
          <button
            className="share__action share__action--toggle"
            onClick={this.toggleMenu}
          >
            Email
          </button>
          <div className={"share__modal " + modalClassModifier}>
            <form onSubmit={this.handleSubmit}>
              <div className="share__form-line">
                <label htmlFor="share--email" className="share__label">
                  To
                </label>
                <input
                  type="email"
                  id="share--email"
                  className="share__input"
                  onChange={this.handleEmailChange}
                  value={this.state.emailAddress}
                  required
                />
              </div>
              <div className="share__form-line">
                <label htmlFor="share--email" className="share__label">
                  Send a copy to yourself
                </label>
                <input
                  type="checkbox"
                  id="share--cc"
                  className="share__input"
                  onChange={this.handleCheckboxChange}
                  checked={this.state.ccSelf}
                />
              </div>
              <div className="share__form-line">
                <input
                  type="submit"
                  className="share__action share__action--email"
                  disabled={this.state.emailHTML.__html.length > 0}
                  value="Generate Email"
                />
              </div>
            </form>
            <div
              className="share__html"
              dangerouslySetInnerHTML={this.state.emailHTML}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default ShareContainer;
