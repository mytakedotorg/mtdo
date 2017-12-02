import * as React from "react";
import YouTube from "react-youtube";
import { getCharRangeFromVideoRange } from "../../utils/functions";
import { Foundation } from "../../java2ts/Foundation";
import CaptionView from "../CaptionView";

interface YTPlayerParameters {
  rel: number;
  cc_load_policy: number;
  cc_lang_pref: string;
  start?: number;
  end?: number;
  autoplay: number;
  showinfo: number;
  modestbranding: number;
  playsinline: 1;
}

interface VideoProps {
  onSetClick: (range: [number, number]) => void;
  videoFact: Foundation.VideoFactContent;
  className?: string;
  timeRange?: [number, number];
}

interface VideoState {
  currentTime: number;
  startTime: number;
  endTime: number;
  captionIsHighlighted: boolean;
  highlightedCharRange: [number, number];
}

class Video extends React.Component<VideoProps, VideoState> {
  private timerId: number | null;
  private player: any;
  constructor(props: VideoProps) {
    super(props);

    let charRange: [number, number] = this.getCharRange(
      props.videoFact,
      props.timeRange
    );

    this.state = {
      currentTime: props.timeRange ? props.timeRange[0] : 0,
      startTime: props.timeRange ? props.timeRange[0] : 0,
      endTime: props.timeRange ? props.timeRange[1] : -1,
      captionIsHighlighted:
        charRange[0] === -1 && charRange[1] === -1 ? false : true,
      highlightedCharRange: charRange
    };
  }
  cueVideo = () => {
    this.player.cueVideoById({
      videoId: this.props.videoFact.youtubeId,
      startSeconds: this.state.startTime,
      endSeconds: this.state.endTime,
      suggestedQuality: "default"
    });
  };
  getCharRange = (
    videoFact: Foundation.VideoFactContent,
    timeRange?: [number, number]
  ): [number, number] => {
    if (timeRange) {
      try {
        if (videoFact.transcript && videoFact.speakerMap) {
          return getCharRangeFromVideoRange(
            videoFact.transcript,
            videoFact.speakerMap,
            timeRange
          );
        } else {
          throw "TODO";
        }
      } catch (err) {
        console.warn(err);
      }
    }
    return [-1, -1];
  };
  handleCaptionHighlight = (
    videoRange: [number, number],
    charRange: [number, number]
  ): void => {
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
  handleCursorPlacement = (videoTime: number): void => {
    this.setState({
      startTime: videoTime,
      endTime: -1
    });
  };
  handleFineTuneUp = (rangeIdx: 0 | 1): void => {
    if (rangeIdx === 0) {
      let startTime = this.state.startTime;
      this.setState({
        startTime: startTime + 0.1
      });
    } else {
      let endTime = this.state.endTime;
      if (endTime >= 0) {
        this.setState({
          endTime: endTime + 0.1
        });
      }
    }
  };
  handleFineTuneDown = (rangeIdx: 0 | 1): void => {
    if (rangeIdx === 0) {
      let startTime = this.state.startTime;
      this.setState({
        startTime: startTime - 0.1
      });
    } else {
      let endTime = this.state.endTime;
      if (endTime >= 0) {
        this.setState({
          endTime: endTime - 0.1
        });
      }
    }
  };
  handlePause = (event: any) => {
    this.setState({
      currentTime: Math.round(event.target.getCurrentTime())
    });
  };
  handleReady = (event: any) => {
    this.player = event.target;
    this.player.pauseVideo();
    this.cueVideo();
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
      this.cueVideo();
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
  componentWillReceiveProps(nextProps: VideoProps) {
    if (
      nextProps.videoFact.youtubeId !== this.props.videoFact.youtubeId &&
      nextProps.timeRange
    ) {
      const charRange = this.getCharRange(
        nextProps.videoFact,
        nextProps.timeRange
      );
      let isHighlighted: boolean;
      if (charRange[0] === -1 && charRange[1] === -1) {
        isHighlighted = false;
      } else {
        isHighlighted = true;
      }
      this.setState({
        highlightedCharRange: charRange,
        captionIsHighlighted: isHighlighted
      });
    }
  }
  render() {
    let playerVars: YTPlayerParameters = {
      rel: 0,
      cc_load_policy: 1,
      cc_lang_pref: "en",
      playsinline: 1,
      autoplay: 1,
      showinfo: 0,
      modestbranding: 1
    };

    playerVars.start = this.state.startTime;
    if (this.state.captionIsHighlighted) {
      if (this.state.endTime >= 0) {
        playerVars.end = this.state.endTime;
      }
    }

    const opts = {
      height: "315",
      width: "560",
      playerVars: playerVars
    };

    const captionEventHandlers = {
      onHighlight: this.handleCaptionHighlight,
      onClearPress: this.handleClearClick,
      onCursorPlace: this.handleCursorPlacement,
      onFineTuneUp: this.handleFineTuneUp,
      onFineTuneDown: this.handleFineTuneDown
    };

    return (
      <div className="video__outer-container">
        <div
          className={
            this.props.className
              ? this.props.className
              : "video__inner-container"
          }
        >
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
                {this.props.videoFact.fact.primaryDate}
              </p>
            </div>
            <YouTube
              videoId={this.props.videoFact.youtubeId}
              opts={opts}
              onReady={this.handleReady}
              onPause={this.handlePause}
              onStateChange={this.handleStateChange}
              className="video__video"
            />
          </div>
          <CaptionView
            timer={this.state.currentTime}
            videoFact={this.props.videoFact}
            captionIsHighlighted={this.state.captionIsHighlighted}
            videoStart={this.state.startTime}
            videoEnd={this.state.endTime}
            eventHandlers={captionEventHandlers}
            highlightedCharRange={this.state.highlightedCharRange}
          />
        </div>
      </div>
    );
  }
}

export default Video;
