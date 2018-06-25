import * as React from "react";

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
  handleUrlClick = () => {
    //TODO
  };
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
        <button className="shareclip__button">Facebook</button>
        <button className="shareclip__button">Twitter</button>
      </div>
    );
  }
}

export default ShareClip;
