import * as React from "react";
import YouTube from "react-youtube";
import { getFact } from "../../utils/functions";
import { VideoFact } from "../../utils/databaseData";
import { YTPlayerParameters } from "../BlockEditor";
import CaptionView from "../CaptionView";

interface VideoProps {
  onSetClick: (range: [number, number]) => void;
  video: VideoFact;
  className: string;
}

interface VideoState {
  currentTime: number;
  startTime: number;
  endTime: number;
  captionIsHighlighted: boolean;
}

class Video extends React.Component<VideoProps, VideoState> {
  private timerId: number | null;
  private player: any;
  constructor(props: VideoProps) {
    super(props);

    this.state = {
      currentTime: 0,
      startTime: 0,
      endTime: -1,
      captionIsHighlighted: false
    };
  }
  handleCaptionHighlight = (videoRange: [number, number]): void => {
    //Set video times
    this.setState({
      captionIsHighlighted: true,
      startTime: videoRange[0],
      endTime: videoRange[1]
    });
  };
  handleClearClick = (): void => {
    this.setState({
      captionIsHighlighted: false
    });
  };
  handlePause = (event: any) => {
    this.setState({
      currentTime: Math.round(event.target.getCurrentTime())
    });
  };
  handleReady = (event: any) => {
    this.player = event.target;
  };
  handleSetClick = () => {
    if (this.state.endTime > this.state.startTime) {
      this.props.onSetClick([this.state.startTime, this.state.endTime]);
    }
  };
  handleStateChange = (event: any) => {
    if (event.data === 0) {
      // Video ended
      this.stopTimer();
    } else if (event.data === 1) {
      // Video playing
      this.startTimer();
      this.setState({
        currentTime: Math.round(event.target.getCurrentTime())
      });
    } else if (event.data === 2) {
      // Video paused
      this.stopTimer();
      this.setState({
        currentTime: Math.round(event.target.getCurrentTime())
      });
    } else if (event.data === 3) {
      // Video buffering
      this.stopTimer();
      this.setState({
        currentTime: Math.round(event.target.getCurrentTime())
      });
    }
  };
  startTimer = () => {
    this.setState({
      currentTime: this.state.currentTime + 1
    });
    this.timerId = window.setTimeout(this.startTimer, 1000);
  };
  stopTimer = () => {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  };
  componentWillUnmount() {
    this.stopTimer();
  }
  render() {
    let playerVars: YTPlayerParameters = {
      rel: 0,
      playsinline: 1
    };

    if (this.state.captionIsHighlighted) {
      playerVars.start = this.state.startTime;
      playerVars.end = this.state.endTime;
    }

    const opts = {
      height: "315",
      width: "560",
      playerVars: playerVars
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
                    Give your Take on this
                  </button>
                : null}
              <p className="video__date">
                {this.props.video.primaryDate.toDateString()}
              </p>
            </div>
            <YouTube
              videoId={this.props.video.id}
              opts={opts}
              onReady={this.handleReady}
              onPause={this.handlePause}
              onStateChange={this.handleStateChange}
              className="video__video"
            />
          </div>
          <CaptionView
            timer={this.state.currentTime}
            videoId={this.props.video.id}
            onHighlight={this.handleCaptionHighlight}
            onClearPress={this.handleClearClick}
            captionIsHighlighted={this.state.captionIsHighlighted}
          />
        </div>
      </div>
    );
  }
}

export default Video;
