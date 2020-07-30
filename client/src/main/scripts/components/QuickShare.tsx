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
import { postRequest } from "../utils/databaseAPI";
import {
  alertErr,
  copyToClipboard,
  getUserCookieString,
  slugify,
} from "../utils/functions";
import { LoginCookie } from "../java2ts/LoginCookie";
import { Routes } from "../java2ts/Routes";

interface ShareReq {
  title: string;
  hStart: string;
  hEnd: string;
  docId?: string;
  vidId?: string;
  vStart?: string;
  vEnd?: string;
}

declare global {
  interface Window {
    fbAsyncInit: any;
  }
}
interface QuickShareProps {
  highlightedRange: [number, number];
  onSendToTake: () => any;
  factHash: string;
  isDocument: boolean;
  viewRange?: [number, number];
}
interface QuickShareState {
  title: string;
  isCopiedToClipboard: boolean;
  url?: string;
}
class QuickShare extends React.Component<QuickShareProps, QuickShareState> {
  private CLIP_TITLE = "cliptitle";
  private ANON = "anonymous";
  private UNTITLED = "untitled";
  private URL_VERSION = "/v1";
  private INPUT_DELAY = 500;
  private timerId: number | null;
  constructor(props: QuickShareProps) {
    super(props);

    this.timerId = window.setTimeout(
      this.handleChangeComplete,
      this.INPUT_DELAY
    );
    this.state = {
      title: "",
      isCopiedToClipboard: false,
      url: "",
    };
  }
  copyToClipboard = () => {
    const request: ShareReq = this.createRequestObject();
    this.createShareableURL(request);
    if (this.state.url) {
      copyToClipboard(this.state.url);
      this.setState({
        isCopiedToClipboard: true,
      });
    } else {
      const msg = "QuickShare: Expected url to not be empty.";
      alertErr(msg);
      throw msg;
    }
    this.logToServer(request);
  };
  createTwitterUrl = (url: string): string => {
    return "https://twitter.com/intent/tweet?url=" + url + "&via=mytakedotorg";
  };
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
    }
    this.timerId = window.setTimeout(
      this.handleChangeComplete,
      this.INPUT_DELAY
    );
    this.setState({ title: event.target.value });
  };
  handleChangeComplete = () => {
    this.timerId = null;
    const request: ShareReq = this.createRequestObject();
    this.createShareableURL(request);
    this.setState({ isCopiedToClipboard: false });
  };
  handleFacebookClick = () => {
    const request: ShareReq = this.createRequestObject();
    this.logToServer(request);
    const url = this.createShareableURL(request);
    this.showFacebookDialog(url);
  };
  handleTwitterClick = () => {
    const request: ShareReq = this.createRequestObject();
    this.logToServer(request);
    const url = this.createShareableURL(request);
    const twitterUrl = this.createTwitterUrl(url);
    window.open(twitterUrl, "_blank");
  };
  logToServer = (request: ShareReq) => {
    // TODO: reqork saving
    // postRequest(Routes.API_SHARE, request, () => {});
  };
  createRequestObject = (): ShareReq => {
    const { highlightedRange, isDocument, factHash, viewRange } = this.props;
    let request: ShareReq = {
      title: this.state.title ? this.state.title : this.UNTITLED,
      vidId: isDocument ? undefined : factHash,
      docId: isDocument ? factHash : undefined,
      hStart: isDocument
        ? highlightedRange[0].toFixed()
        : highlightedRange[0].toFixed(3),
      hEnd: isDocument
        ? highlightedRange[1].toFixed()
        : highlightedRange[1].toFixed(3),
    };
    if (viewRange) {
      request.vStart = isDocument
        ? viewRange[0].toFixed()
        : viewRange[0].toFixed(3);
      request.vEnd = isDocument
        ? viewRange[1].toFixed()
        : viewRange[1].toFixed(3);
    }
    return request;
  };
  encodeRequestObject = (req: ShareReq): string => {
    const requestStr = JSON.stringify(req);
    const encodedStr = btoa(requestStr);
    return encodedStr;
  };
  createShareableURL = (req: ShareReq): string => {
    const encodedReq: string = this.encodeRequestObject(req);
    ///anonymous/:title/v1/BASE64-ENCODED-JSON
    const cookieStr = getUserCookieString();
    let username;
    if (cookieStr) {
      const cookie: LoginCookie = JSON.parse(JSON.parse(cookieStr));
      username = cookie.username;
    } else {
      username = this.ANON;
    }
    const url =
      window.location.protocol +
      "//" +
      window.location.hostname +
      "/" +
      username +
      "/" +
      slugify(this.state.title ? this.state.title : this.UNTITLED) +
      this.URL_VERSION +
      "/" +
      encodedReq;
    this.setState({ url: url });
    return url;
  };
  showFacebookDialog = (url: string) => {
    FB.ui(
      {
        method: "share",
        href: url,
      },
      function (response) {}
    );
  };
  urlDidUpdate = (factSlugChanged: boolean) => {
    if (factSlugChanged) {
      this.setState({ isCopiedToClipboard: false, url: "", title: "" });
    } else {
      this.setState({ isCopiedToClipboard: false, url: "" });
    }
  };
  componentWillReceiveProps(nextProps: QuickShareProps) {
    const { factHash, highlightedRange, viewRange } = this.props;
    if (nextProps.factHash !== factHash) {
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
  componentDidMount() {
    const request: ShareReq = this.createRequestObject();
    this.createShareableURL(request);
  }
  render() {
    return (
      <div className="quickshare">
        <h3 className="quickshare__title">Share your clip</h3>
        <div>
          <label className="quickshare__label" htmlFor={this.CLIP_TITLE}>
            Title
          </label>
          <input
            className="quickshare__input"
            id={this.CLIP_TITLE}
            type="text"
            value={this.state.title}
            onChange={this.handleChange}
          />
          <pre className="quickshare__url">
            {this.state.url ? <code>{this.state.url}</code> : null}
          </pre>
          <button className="quickshare__button" onClick={this.copyToClipboard}>
            Copy link
          </button>
          <button
            className="quickshare__button"
            onClick={this.handleFacebookClick}
          >
            Facebook
          </button>
          <button
            className="quickshare__button"
            onClick={this.handleTwitterClick}
          >
            Twitter
          </button>
          <button
            className="quickshare__button"
            onClick={this.props.onSendToTake}
          >
            Give your Take
          </button>
          <div className="quickshare__info">
            {this.state.isCopiedToClipboard ? (
              <span className="quickshare__success">Copied to clipboard</span>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default QuickShare;
