import * as React from "react";
import * as ReactDOM from "react-dom";
import { TakeDocument } from "./BlockEditor";
import { sendEmail } from "../utils/databaseAPI";
import { getUserCookieString } from "../utils/functions";
import { Routes } from "../java2ts/Routes";
import isEqual = require("lodash/isEqual");

interface ShareContainerProps {
  takeDocument: TakeDocument;
}

interface ShareContainerState {
  isLoggedIn: boolean;
  emailSent: boolean;
  emailSending: boolean;
  modalIsOpen: boolean;
}

class ShareContainer extends React.Component<
  ShareContainerProps,
  ShareContainerState
> {
  private div: HTMLDivElement;
  constructor(props: ShareContainerProps) {
    super(props);

    const isLoggedIn = getUserCookieString().length > 0;

    this.state = {
      isLoggedIn: isLoggedIn,
      emailSent: false,
      emailSending: false,
      modalIsOpen: false
    };
  }
  handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (this.state.isLoggedIn) {
      if (!this.state.emailSending) {
        this.setState({
          emailSending: true
        });

        let url;
        if (!window.location.pathname.startsWith(Routes.DRAFTS)) {
          url = window.location.pathname;
        } else {
          url = null;
        }
        sendEmail(
          (Object as any).assign({}, this.props.takeDocument),
          url,
          () => {
            this.setState({
              emailSent: true,
              emailSending: false
            });
          }
        );
      }
      event.preventDefault();
    } else {
      window.location.href =
        Routes.LOGIN +
        "?redirect=" +
        window.location.pathname +
        "&loginreason=You+must+have+an+account+to+email+a+Take.";
    }
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
  componentWillReceiveProps(nextProps: ShareContainerProps) {
    if (this.state.emailSent) {
      if (!isEqual(nextProps.takeDocument, this.props.takeDocument)) {
        this.setState({
          emailSent: false
        });
      }
    }
  }
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

    let innerContent;

    if (this.state.emailSent) {
      innerContent = (
        <span className="share__action share__action--sent">Email sent</span>
      );
    } else if (this.state.emailSending) {
      innerContent = (
        <span className="share__action share__action--sent">
          Sending email...
        </span>
      );
    } else {
      innerContent = (
        <button
          className="share__action share__action--email"
          onClick={this.handleClick}
        >
          {this.state.isLoggedIn ? "Send Email" : "Login"}
        </button>
      );
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
            <p className="share__text">Email this Take to yourself.</p>
            {innerContent}
          </div>
        </div>
      </div>
    );
  }
}

export default ShareContainer;
