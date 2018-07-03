import * as React from "react";
import { postRequest } from "../utils/databaseAPI";
import {
  alertErr,
  copyToClipboard,
  getUserCookieString,
  slugify
} from "../utils/functions";
import { Routes } from "../java2ts/Routes";
import { Share } from "../java2ts/Share";

declare global {
  interface Window {
    fbAsyncInit: any;
  }
}
interface ShareClipProps {
  factSlug: string;
  highlightedRange: [number, number];
  viewRange?: [number, number];
}
interface ShareClipState {
  title: string;
  isCopiedToClipboard: boolean;
  url?: string;
}
class ShareClip extends React.Component<ShareClipProps, ShareClipState> {
  private CLIP_TITLE = "cliptitle";
  private ANON = "anonymous";
  private UNTITLED = "untitled";
  constructor(props: ShareClipProps) {
    super(props);

    this.state = {
      title: "",
      isCopiedToClipboard: false,
      url: ""
    };
  }
  copyToClipboard = () => {
    if (this.state.url) {
      copyToClipboard(this.state.url);
      this.setState({
        isCopiedToClipboard: true
      });
    } else {
      const msg = "ShareClip: Expected url to not be empty.";
      alertErr(msg);
      throw msg;
    }
  };
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value });
  };
  handleFacebookClick = () => {
    const request: Share.ShareReq = this.createRequestObject(
      Share.Constants.METHOD_FACEBOOK
    );
    this.logToServer(request);
    this.showFacebookDialog();
  };
  handleTwitterClick = () => {
    const request: Share.ShareReq = this.createRequestObject(
      Share.Constants.METHOD_TWITTER
    );
    this.logToServer(request);
  };
  handleUrlClick = () => {
    const request: Share.ShareReq = this.createRequestObject(
      Share.Constants.METHOD_URL
    );
    this.logToServer(request);
    this.createShareableURL(request);
  };
  logToServer = (request: Share.ShareReq) => {
    postRequest(Routes.API_SHARE, request, () => {});
  };
  createRequestObject = (method: string): Share.ShareReq => {
    const { highlightedRange, viewRange } = this.props;
    let request: Share.ShareReq = {
      title: this.state.title ? this.state.title : this.UNTITLED,
      method: method,
      factSlug: this.props.factSlug,
      highlightedRangeStart: highlightedRange[0].toString(),
      highlightedRangeEnd: highlightedRange[1].toString()
    };
    if (viewRange) {
      request.viewRangeStart = viewRange[0].toString();
      request.viewRangeEnd = viewRange[1].toString();
    }
    return request;
  };
  encodeRequestObject = (req: Share.ShareReq): string => {
    const requestStr = JSON.stringify(req);
    const encodedStr = Buffer.from(requestStr).toString("base64");
    return encodedStr;
  };
  createShareableURL = (req: Share.ShareReq): void => {
    const encodedReq: string = this.encodeRequestObject(req);
    ///anonymous/:title/foundation-v1/BASE64-ENCODED-JSON
    const cookieStr = getUserCookieString();
    const username = cookieStr ? cookieStr : this.ANON;
    const url =
      window.location.protocol +
      "//" +
      window.location.hostname +
      "/" +
      username +
      "/" +
      slugify(this.state.title ? this.state.title : this.UNTITLED) +
      Routes.FOUNDATION_V1 +
      "/" +
      encodedReq;
    this.setState({ url: url });
  };
  showFacebookDialog = () => {
    FB.ui(
      {
        method: "share",
        href: window.location.href
      },
      function(response) {}
    );
  };
  urlDidUpdate = (factSlugChanged: boolean) => {
    if (factSlugChanged) {
      this.setState({ isCopiedToClipboard: false, url: "", title: "" });
    } else {
      this.setState({ isCopiedToClipboard: false, url: "" });
    }
  };
  componentWillReceiveProps(nextProps: ShareClipProps) {
    const { factSlug, highlightedRange, viewRange } = this.props;
    if (nextProps.factSlug !== factSlug) {
      this.urlDidUpdate(true);
    } else if (
      nextProps.highlightedRange[0] !== highlightedRange[0] ||
      nextProps.highlightedRange[1] !== highlightedRange[1]
    ) {
      this.urlDidUpdate(false);
    } else if (
      nextProps.viewRange &&
      viewRange &&
      (nextProps.viewRange[0] !== viewRange[0] ||
        nextProps.viewRange[1] !== viewRange[1])
    ) {
      this.urlDidUpdate(false);
    }
  }
  render() {
    return (
      <div className="shareclip">
        <h3 className="shareclip__title">Share your clip</h3>
        {this.state.url ? (
          <div>
            <pre className="shareclip__url">
              <code>{this.state.url}</code>
            </pre>
            {this.state.isCopiedToClipboard ? (
              <p className="shareclip__success" onClick={this.copyToClipboard}>
                Copied to clipboard
              </p>
            ) : (
              <button
                className="shareclip__button"
                onClick={this.copyToClipboard}
              >
                Copy to clipboard
              </button>
            )}
          </div>
        ) : (
          <div>
            <label className="shareclip__label" htmlFor={this.CLIP_TITLE}>
              Title
            </label>
            <input
              className="shareclip__input"
              id={this.CLIP_TITLE}
              type="text"
              value={this.state.title}
              onChange={this.handleChange}
            />
            <button className="shareclip__button" onClick={this.handleUrlClick}>
              Get a shareable URL
            </button>
            <button
              className="shareclip__button"
              onClick={this.handleFacebookClick}
            >
              Facebook
            </button>
            <button
              className="shareclip__button"
              onClick={this.handleTwitterClick}
            >
              Twitter
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default ShareClip;
