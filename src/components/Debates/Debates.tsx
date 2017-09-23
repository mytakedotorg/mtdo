import * as React from "react";
import YouTube from "react-youtube";
import { getFact } from "../../utils/functions";
import { VideoFact } from "../../utils/database";

interface DebatesProps {
  onSetClick: (range: [number, number]) => void;
  video: VideoFact;
}

interface DebatesState {
  currentTime: number;
  startTime: number;
  endTime: number;
}

interface DebateVideo {
  id: string;
  img: string;
  title: string;
  date: string;
}

class Debates extends React.Component<DebatesProps, DebatesState> {
  constructor(props: DebatesProps) {
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
      <div className="debates">
        <h2 className="debates__heading">Debates</h2>
        <p className="debates__instructions">
          Choose a video clip to support your Take.
        </p>
        <button onClick={this.handleSetClick}>Send to Take</button>
        <div className="debates__row">
          <div className="debates__video-container">
            {this.props.video
              ? <div>
                  <h3 className="debates__video-title">
                    {this.props.video.title}
                  </h3>
                  <p className="debates__video-date">
                    {this.props.video.primaryDate.toDateString()}
                  </p>
                  <YouTube
                    videoId={this.props.video.id}
                    opts={opts}
                    onPause={this.handlePause}
                    className="debates__video"
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

export default Debates;
