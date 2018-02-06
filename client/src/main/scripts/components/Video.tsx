import * as React from "react";
import YouTube from "react-youtube";
import isEqual = require("lodash/isEqual");
import { getCharRangeFromVideoRange } from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";
import CaptionView, { CaptionViewEventHandlers } from "./CaptionView";
import { Routes } from "../java2ts/Routes";

interface YTPlayerParameters {
  rel: number;
  cc_load_policy: number;
  cc_lang_pref: string;
  controls: number;
  start?: number;
  end?: number;
  autoplay: number;
  showinfo: number;
  modestbranding: number;
  playsinline: 1;
}

interface TimeRange {
  start: number;
  end: number;
  fixedDuration: boolean;
}

interface RangeSliders {
  transcriptViewRange: TimeRange;
  zoomedRange?: TimeRange;
}

interface VideoProps {
  onSetClick: (range: [number, number]) => void;
  onRangeSet?: (videoRange: [number, number]) => void;
  onClearClick?: () => void;
  videoFact: Foundation.VideoFactContent;
  className?: string;
  clipRange?: [number, number] | null;
}

interface VideoState {
  currentTime: number;
  clipStart: number;
  clipEnd: number;
  duration: number;
  isPaused: boolean;
  captionIsHighlighted: boolean;
  highlightedCharRange: [number, number];
  rangeSliders: RangeSliders;
}

class Video extends React.Component<VideoProps, VideoState> {
  private timerId: number | null;
  private player: any;
  constructor(props: VideoProps) {
    super(props);

    let charRange: [number, number] = this.getCharRange(
      props.videoFact,
      props.clipRange
    );

    this.state = {
      currentTime: props.clipRange ? props.clipRange[0] : 0,
      clipStart: props.clipRange ? props.clipRange[0] : 0,
      clipEnd: props.clipRange ? props.clipRange[1] : 0,
      isPaused: true,
      duration: 5224,
      captionIsHighlighted:
        charRange[0] === -1 && charRange[1] === -1 ? false : true,
      highlightedCharRange: charRange,
      rangeSliders: {
        transcriptViewRange: {
          start: 0,
          end: 20,
          fixedDuration: true
        }
      }
    };
  }
  cueVideo = () => {
    if (this.player) {
      this.player.cueVideoById({
        videoId: this.props.videoFact.youtubeId,
        startSeconds: this.state.clipStart,
        endSeconds: this.state.clipEnd,
        suggestedQuality: "default"
      });
    }
  };
  getCharRange = (
    videoFact: Foundation.VideoFactContent,
    timeRange?: [number, number] | null
  ): [number, number] => {
    if (timeRange) {
      if (videoFact.transcript && videoFact.speakerMap) {
        return getCharRangeFromVideoRange(
          videoFact.transcript,
          videoFact.speakerMap,
          timeRange
        );
      } else {
        console.warn("Captions not yet done for this video");
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
      clipStart: videoRange[0],
      clipEnd: videoRange[1]
    });
    if (this.props.onRangeSet) {
      this.props.onRangeSet([videoRange[0], videoRange[1]]);
    }
  };
  handleClearClick = (): void => {
    this.setState({
      captionIsHighlighted: false
    });
    if (this.props.onClearClick) {
      this.props.onClearClick();
    }
  };
  handleFineTuneUp = (rangeIdx: 0 | 1): void => {
    if (rangeIdx === 0) {
      let startTime = this.state.clipStart;
      this.setState({
        clipStart: startTime + 0.1
      });
    } else {
      let endTime = this.state.clipEnd;
      if (endTime >= 0) {
        this.setState({
          clipEnd: endTime + 0.1
        });
      }
    }
  };
  handleFineTuneDown = (rangeIdx: 0 | 1): void => {
    if (rangeIdx === 0) {
      let startTime = this.state.clipStart;
      this.setState({
        clipStart: startTime - 0.1
      });
    } else {
      let endTime = this.state.clipEnd;
      if (endTime >= 0) {
        this.setState({
          clipEnd: endTime - 0.1
        });
      }
    }
  };
  handlePlayPausePress = () => {
    // External play/pause button was pressed
    const isPaused = this.state.isPaused;
    if (isPaused) {
      if (this.player) {
        this.player.playVideo();
      }
    } else {
      if (this.player) {
        this.player.pauseVideo();
      }
    }
    this.setState({
      isPaused: !isPaused
    });
  };
  handlePause = (event: any) => {
    // Player was paused with player controls
    this.setState({
      currentTime: Math.round(event.target.getCurrentTime())
    });
  };
  handleSelectionRangeChange = (range: [number, number]) => {
    // // Clear the selection
    // this.setState({
    //   currentTime: range[1],
    //   startTime: range[0],
    //   endTime: range[2],
    //   captionIsHighlighted: false
    // });
    const charRange: [number, number] = this.getCharRange(
      this.props.videoFact,
      [range[0], range[1]]
    );
    this.setState({
      clipStart: range[0],
      clipEnd: range[1],
      captionIsHighlighted: true,
      highlightedCharRange: charRange
    });
  };
  handleReady = (event: any) => {
    this.player = event.target;
    this.cueVideo();
  };
  handleRestartPress = () => {
    if (this.state.captionIsHighlighted) {
      const clipStart = this.state.clipStart;
      this.setState({
        currentTime: clipStart
      });
      if (this.player) {
        this.player.seekTo(clipStart);
      }
    } else {
      this.setState({
        currentTime: 0
      });
      if (this.player) {
        this.player.seekTo(0);
      }
    }
  };
  handleSetClick = () => {
    if (this.state.clipEnd > this.state.clipStart) {
      this.props.onSetClick([this.state.clipStart, this.state.clipEnd]);
    }
  };
  handleSkipBackPress = (seconds: number) => {
    this.skipSeconds(-seconds);
  };
  handleSkipForwardPress = (seconds: number) => {
    this.skipSeconds(seconds);
  };
  skipSeconds = (seconds: number) => {
    const newTime = this.state.currentTime + seconds;
    this.setState({
      currentTime: newTime
    });
    if (this.player) {
      this.player.seekTo(newTime);
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
        currentTime: Math.round(event.target.getCurrentTime()),
        isPaused: false
      });
    } else if (event.data === 2) {
      // Video paused
      this.stopTimer();
      this.setState({
        currentTime: Math.round(event.target.getCurrentTime()),
        isPaused: true
      });
    } else if (event.data === 3) {
      // Video buffering
      this.stopTimer();
      this.setState({
        currentTime: Math.round(event.target.getCurrentTime()),
        isPaused: false
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
      nextProps.clipRange
    ) {
      // Component has a new youtube video and a time range
      const charRange = this.getCharRange(
        nextProps.videoFact,
        nextProps.clipRange
      );
      let isHighlighted: boolean;
      if (charRange[0] === -1 && charRange[1] === -1) {
        isHighlighted = false;
      } else {
        isHighlighted = true;
      }
      this.setState({
        highlightedCharRange: charRange,
        captionIsHighlighted: isHighlighted,
        isPaused: true
      });
    } else if (
      !nextProps.clipRange &&
      window.location.pathname.startsWith(Routes.FOUNDATION)
    ) {
      // No time range and on a /foundation route or sub-route
      this.setState({
        clipStart: 0,
        clipEnd: 0,
        captionIsHighlighted: false,
        highlightedCharRange: [-1, -1],
        isPaused: true
      });
      if (this.player) {
        this.player.pauseVideo();
      }
    } else if (
      nextProps.clipRange &&
      !isEqual(nextProps.clipRange, this.props.clipRange)
    ) {
      // There is a time range and it's different than the previous range
      let charRange: [number, number] = this.getCharRange(
        nextProps.videoFact,
        nextProps.clipRange
      );

      this.setState({
        currentTime: nextProps.clipRange[0],
        clipStart: nextProps.clipRange[0],
        clipEnd: nextProps.clipRange[1],
        captionIsHighlighted:
          charRange[0] === -1 && charRange[1] === -1 ? false : true,
        highlightedCharRange: charRange
      });
    }
  }
  render() {
    let playerVars: YTPlayerParameters = {
      rel: 0,
      cc_load_policy: 1,
      cc_lang_pref: "en",
      controls: 0,
      playsinline: 1,
      autoplay: 1,
      showinfo: 0,
      modestbranding: 1
    };

    playerVars.start = this.state.clipStart;
    if (this.state.captionIsHighlighted) {
      if (this.state.clipEnd > 0) {
        playerVars.end = this.state.clipEnd;
      }
    }

    const opts = {
      height: "315",
      width: "560",
      playerVars: playerVars
    };

    const captionEventHandlers: CaptionViewEventHandlers = {
      onHighlight: this.handleCaptionHighlight,
      onClearPress: this.handleClearClick,
      onFineTuneUp: this.handleFineTuneUp,
      onFineTuneDown: this.handleFineTuneDown,
      onPlayPausePress: this.handlePlayPausePress,
      onSelectionRangeChange: this.handleSelectionRangeChange,
      onRestartPress: this.handleRestartPress,
      onSkipBackPress: this.handleSkipBackPress,
      onSkipForwardPress: this.handleSkipForwardPress
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
              {this.state.clipEnd > this.state.clipStart ? (
                <button
                  className="video__button video__button--top"
                  onClick={this.handleSetClick}
                >
                  Give your Take on this
                </button>
              ) : null}
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
            clipStart={this.state.clipStart}
            clipEnd={this.state.clipEnd}
            isPaused={this.state.isPaused}
            videoDuration={this.state.duration}
            eventHandlers={captionEventHandlers}
            highlightedCharRange={this.state.highlightedCharRange}
          />
        </div>
      </div>
    );
  }
}

export default Video;
