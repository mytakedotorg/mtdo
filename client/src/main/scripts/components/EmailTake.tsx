import * as React from "react";
import * as ReactDOM from "react-dom";
import { TakeDocument } from "./BlockEditor";
import { sendEmail } from "../utils/databaseAPI";
import { getUserCookieString } from "../utils/functions";
import { Routes } from "../java2ts/Routes";
import isEqual = require("lodash/isEqual");

interface EmailTakeProps {
  takeDocument: TakeDocument;
}

interface EmailTakeState {
  isLoggedIn: boolean;
  emailSent: boolean;
  emailSending: boolean;
}

class EmailTake extends React.Component<EmailTakeProps, EmailTakeState> {
  constructor(props: EmailTakeProps) {
    super(props);

    const isLoggedIn = getUserCookieString().length > 0;

    this.state = {
      isLoggedIn: isLoggedIn,
      emailSent: false,
      emailSending: false
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
  componentWillReceiveProps(nextProps: EmailTakeProps) {
    if (this.state.emailSent) {
      if (!isEqual(nextProps.takeDocument, this.props.takeDocument)) {
        this.setState({
          emailSent: false
        });
      }
    }
  }
  render() {
    let innerContent;

    if (this.state.emailSent) {
      innerContent = (
        <span className="share__action share__action--success">Email sent</span>
      );
    } else if (this.state.emailSending) {
      innerContent = (
        <span className="share__action share__action--success">
          Sending email...
        </span>
      );
    } else {
      innerContent = (
        <button
          className="share__action share__action--clickable"
          onClick={this.handleClick}
        >
          {this.state.isLoggedIn ? "Send Email" : "Login"}
        </button>
      );
    }
    return (
      <div>
        <p className="share__text">Email this Take to yourself.</p>
        {innerContent}
      </div>
    );
  }
}

export default EmailTake;
