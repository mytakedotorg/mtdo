import * as React from "react";
import YouTube from "react-youtube";
import { Foundation } from "../java2ts/Foundation";

interface YTPlayerParameters {
  rel: number;
  cc_load_policy: number;
  cc_lang_pref: string;
  controls: number;
  start?: number;
  end?: number | null;
  autoplay: number;
  showinfo: number;
  modestbranding: number;
  playsinline: number;
}

export interface VideoLiteProps {
  isFixed: boolean;
  onScroll: (fixVideo: boolean) => any;
  videoId: string;
  clipRange?: [number, number];
}

interface VideoLiteState {
  currentTime: number;
  isPaused: boolean;
}

class VideoLite extends React.Component<VideoLiteProps, VideoLiteState> {
  private timerId: number | null;
  private player: any;
  private playerVars: YTPlayerParameters;
  private container: HTMLDivElement;
  constructor(props: VideoLiteProps) {
    super(props);

    this.playerVars = {
      rel: 0,
      cc_load_policy: 1,
      cc_lang_pref: "en",
      controls: 1,
      playsinline: 1,
      autoplay: 1,
      showinfo: 0,
      modestbranding: 1
    };

    if (props.clipRange) {
      this.playerVars.start = props.clipRange[0];
      this.playerVars.end = props.clipRange[1];
    }

    this.state = {
      currentTime: props.clipRange ? props.clipRange[0] : 0,
      isPaused: true
    };
  }
  cueVideo = (props: VideoLiteProps) => {
    if (this.player) {
      if (props.clipRange) {
        this.player.cueVideoById({
          videoId: props.videoId,
          startSeconds: props.clipRange[0],
          endSeconds: props.clipRange[1],
          suggestedQuality: "default"
        });
        this.playerVars.start = props.clipRange[0];
        this.playerVars.end = props.clipRange[1];
      } else {
        this.player.cueVideoById({
          videoId: props.videoId,
          suggestedQuality: "default"
        });
      }
    }
  };
  handlePause = (event: any) => {
    // Player was paused with player controls
    this.setState({
      currentTime: Math.round(event.target.getCurrentTime())
    });
  };
  handleReady = (event: any) => {
    this.player = event.target;
    this.cueVideo(this.props);
  };
  handleScroll = () => {
    this.props.onScroll(this.container.getBoundingClientRect().top <= 0);
  };
  handleStateChange = (event: any) => {
    if (event.data === 0) {
      // Video ended
      this.stopTimer();
      this.cueVideo(this.props);
      this.setState({
        isPaused: true
      });
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
  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
  }
  componentWillUnmount() {
    this.stopTimer();
    window.removeEventListener("scroll", this.handleScroll);
  }
  componentWillReceiveProps(nextProps: VideoLiteProps) {
    if (nextProps.videoId && !this.props.videoId) {
      this.cueVideo(nextProps);
    }
    if (
      (nextProps.clipRange && !this.props.clipRange) ||
      (nextProps.clipRange &&
        this.props.clipRange &&
        nextProps.clipRange[0] !== this.props.clipRange[0] &&
        nextProps.clipRange[1] !== this.props.clipRange[1])
    ) {
      this.cueVideo(nextProps);
      this.player.seekTo(nextProps.clipRange[0]);
      this.player.playVideo();
      this.playerVars.start = nextProps.clipRange[0];
      this.playerVars.end = nextProps.clipRange[1];
    }
  }
  render() {
    const opts = {
      height: "315",
      width: "560",
      playerVars: this.playerVars
    };

    const fixedClass = this.props.isFixed ? "video__fixed" : "";

    return (
      <div
        className="video__outer-container"
        ref={(div: HTMLDivElement) => (this.container = div)}
      >
        <div className="video__inner-container">
          <div className={fixedClass}>
            <div className="video__video-container">
              <YouTube
                videoId={this.props.videoId}
                opts={opts}
                onReady={this.handleReady}
                onPause={this.handlePause}
                onStateChange={this.handleStateChange}
                className="video__video"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default VideoLite;
