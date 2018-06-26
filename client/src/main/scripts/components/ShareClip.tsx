import * as React from "react";
import { postRequest } from "../utils/databaseAPI";
import { Routes } from "../java2ts/Routes";
import { Share } from "../java2ts/Share";

declare global {
  interface Window {
    fbAsyncInit: any;
  }
}

interface ShareDialogProps {
  factSlug: string;
  highlightedRange: [number, number];
  viewRange?: [number, number];
}
interface ShareDialogState {
  title: string;
}
class ShareClip extends React.Component<ShareDialogProps, ShareDialogState> {
  private CLIP_TITLE = "cliptitle";
  constructor(props: ShareDialogProps) {
    super(props);

    this.state = {
      title: ""
    };
  }
  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value });
  };
  handleFacebookClick = () => {
    FB.ui(
      {
        method: "share",
        href: window.location.href
      },
      function(resonse) {}
    );
  };
  handleTwitterClick = () => {};
  handleServerResponse = (json: any) => {
    console.log("Server responded");
    if (json) {
      console.log(json);
    }
  };
  handleUrlClick = () => {
    const { highlightedRange, viewRange } = this.props;
    let request: Share.ShareReq = {
      title: this.state.title,
      method: Share.METHOD_URL,
      factSlug: this.props.factSlug,
			highlightedRangeStart: highlightedRange[0].toString(),
			highlightedRangeEnd: highlightedRange[1].toString(),
    };
    if (viewRange) {
			request.viewRangeStart = viewRange[0].toString();
			request.viewRangeEnd = viewRange[1].toString();
    }
    postRequest(Routes.API_SHARE, request, this.handleServerResponse);
  };
  componentDidMount() {
    window.fbAsyncInit = function() {
      FB.init({
        appId: "1014270045380974",
        autoLogAppEvents: true,
        xfbml: true,
        version: "v3.0"
      });
    };

    (function(d, s, id) {
      var js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      (js as any).src = "https://connect.facebook.net/en_US/sdk.js";
      (fjs as any).parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }
  render() {
    return (
      <div className="shareclip">
        <h3 className="shareclip__title">Share your clip</h3>
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
        <button className="shareclip__button" onClick={this.handleTwitterClick}>
          Twitter
        </button>
      </div>
    );
  }
}

export default ShareClip;
