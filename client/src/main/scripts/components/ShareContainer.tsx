import * as React from "react";
import * as ReactDOM from "react-dom";
import { TakeDocument } from "./BlockEditor";
import { sendEmail } from "../utils/databaseAPI";

interface ShareContainerProps {
  takeDocument: TakeDocument;
}

interface ShareContainerState {
  emailHTML: {
    __html: string;
  };
}

class ShareContainer extends React.Component<
  ShareContainerProps,
  ShareContainerState
> {
  constructor(props: ShareContainerProps) {
    super(props);

    this.state = {
      emailHTML: {
        __html: ""
      }
    };
  }
  handleEmailSharePress = () => {
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
  };
  render() {
    return (
      <div className="share__container">
        <div className="share__inner-container">
          <h1>Share</h1>
          <button
            className="share__button share__button--email"
            onClick={this.handleEmailSharePress}
          >
            Email
          </button>
          <div
            className="share__modal"
            dangerouslySetInnerHTML={this.state.emailHTML}
          />
        </div>
      </div>
    );
  }
}

export default ShareContainer;
