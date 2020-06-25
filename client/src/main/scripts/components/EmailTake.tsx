/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
      <div className="emailtake">
        <p className="share__text">Email this Take to yourself.</p>
        {innerContent}
      </div>
    );
  }
}

export default EmailTake;
