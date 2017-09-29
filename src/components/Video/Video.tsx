import * as React from "react";
import YouTube from "react-youtube";
import { getFact } from "../../utils/functions";
import { VideoFact } from "../../utils/databaseData";

interface VideoProps {
  onSetClick: (range: [number, number]) => void;
  video: VideoFact;
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
      <div className="video">
        <h2 className="video__heading">Debates</h2>
        <p className="video__instructions">
          Choose a video clip to support your Take.
        </p>
        <button onClick={this.handleSetClick}>Send to Take</button>
        <div className="video__row">
          <div className="video__container">
            {this.props.video
              ? <div>
                  <h3 className="video__title">
                    {this.props.video.title}
                  </h3>
                  <p className="video__date">
                    {this.props.video.primaryDate.toDateString()}
                  </p>
                  <YouTube
                    videoId={this.props.video.id}
                    opts={opts}
                    onPause={this.handlePause}
                    className="video__video"
                  />
                  <p>
                    Pause the video where you want your clip to start or stop.
                  </p>
                  <p>
                    Current Start Time: <span>{this.state.startTime}</span>
                  </p>
                  <button onClick={this.handleSetStart}>Set Start Time</button>
                  <p>
                    Current End Time: <span>{this.state.endTime}</span>
                  </p>
                  <button onClick={this.handleSetEnd}>Set End Time</button>
                </div>
              : null}
          </div>
        </div>
      </div>
    );
  }
}

export default Video;
