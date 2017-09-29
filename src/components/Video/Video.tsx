import * as React from "react";
import YouTube from "react-youtube";
import { getFact } from "../../utils/functions";
import { VideoFact } from "../../utils/databaseData";

interface VideoProps {
  onSetClick: (range: [number, number]) => void;
  video: VideoFact;
  className: string;
}

interface VideoState {
  currentTime: number;
  startTime: number;
  endTime: number;
}

class Video extends React.Component<VideoProps, VideoState> {
  constructor(props: VideoProps) {
    super(props);

    this.state = {
      currentTime: 0,
      startTime: 0,
      endTime: -1
    };
  }
  handlePause = (event: any) => {
    this.setState({
      currentTime: Math.round(event.target.getCurrentTime())
    });
  };
  handleSetClick = () => {
    if (this.state.endTime > this.state.startTime) {
      this.props.onSetClick([this.state.startTime, this.state.endTime]);
    }
  };
  handleSetStart = () => {
    const startTime = this.state.currentTime;
    this.setState({
      startTime: startTime
    });
  };
  handleSetEnd = () => {
    const endTime = this.state.currentTime;
    this.setState({
      endTime: endTime
    });
  };
  render() {
    const opts = {
      height: "315",
      width: "560",
      playerVars: {
        rel: 0
      }
    };

    return (
      <div className="video__outer-container">
        <div className={this.props.className}>
          <div className="video__container">
            <div className="video__header">
              {this.state.endTime > this.state.startTime
                ? <button
                    className="video__button video__button--top"
                    onClick={this.handleSetClick}
                  >
                    Send to Take
                  </button>
                : null}
              <p className="video__date">
                {this.props.video.primaryDate.toDateString()}
              </p>
            </div>
            <YouTube
              videoId={this.props.video.id}
              opts={opts}
              onPause={this.handlePause}
              className="video__video"
            />
          </div>
          <div className="video__actions">
            <div className="video__action">
              <p className="video__instructions">
                Current Start Time: <span>{this.state.startTime}</span>
              </p>
              <button className="video__button" onClick={this.handleSetStart}>
                Set Start Time
              </button>
            </div>
            <div className="video__action">
              <p className="video__instructions">
                Current End Time:{" "}
                <span>{this.state.endTime > 0 ? this.state.endTime : "-"}</span>
              </p>
              <button className="video__button" onClick={this.handleSetEnd}>
                Set End Time
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Video;
