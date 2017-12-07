import * as React from "react";
import * as keycode from "keycode";
import YouTube from "react-youtube";
import Video from "./Video";
import { fetchFact } from "../utils/databaseAPI";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { VideoBlock } from "../java2ts/VideoBlock";
import { isWriteOnly, WritingEventHandlers } from "./BlockEditor";

interface EditorVideoContainerProps {
  idx: number;
  active: boolean;
  block: VideoBlock;
  eventHandlers?: WritingEventHandlers;
}

interface EditorVideoContainerState {
  loading: boolean;
  error: boolean;
  videoFact?: Foundation.VideoFactContent;
}

class EditorVideoContainer extends React.Component<
  EditorVideoContainerProps,
  EditorVideoContainerState
> {
  constructor(props: EditorVideoContainerProps) {
    super(props);
    this.state = {
      loading: true,
      error: false
    };
  }
  getFact = (factHash: string) => {
    fetchFact(
      factHash,
      (
        error: string | Error | null,
        factContent: Foundation.VideoFactContent
      ) => {
        if (error) {
          this.setState({
            error: true
          });
        } else {
          this.setState({
            loading: false,
            videoFact: factContent
          });
        }
      }
    );
  };
  handleRetryClick = () => {
    this.setState({
      error: false
    });
    this.getFact(this.props.block.videoId);
  };
  componentDidMount() {
    this.getFact(this.props.block.videoId);
  }
  componentWillReceiveProps(nextProps: EditorVideoContainerProps) {
    if (this.props.block.videoId !== nextProps.block.videoId) {
      this.getFact(nextProps.block.videoId);
    }
  }
  render() {
    return (
      <div>
        {this.state.error ? (
          <VideoErrorView onRetryClick={this.handleRetryClick} />
        ) : this.state.loading || !this.state.videoFact ? (
          <VideoLoadingView />
        ) : (
          <EditorVideo
            idx={this.props.idx}
            active={this.props.active}
            videoFact={this.state.videoFact}
            factHash={this.props.block.videoId}
            range={this.props.block.range}
            eventHandlers={this.props.eventHandlers}
          />
        )}
      </div>
    );
  }
}

const VideoLoadingView: React.StatelessComponent<{}> = props => (
  <div className="editor__document editor__document--base editor__document--hover">
    <h2 className="editor__document-title">Loading</h2>
  </div>
);

interface VideoErrorViewProps {
  onRetryClick: () => any;
}

const VideoErrorView: React.StatelessComponent<VideoErrorViewProps> = props => (
  <div className="editor__document editor__document--base editor__document--hover">
    <h2 className="editor__document-title">Error loading Foundation Video</h2>
    <button
      className="editor__button editor__button--reload"
      onClick={props.onRetryClick}
    >
      retry?
    </button>
  </div>
);

interface EditorVideoBlockProps {
  idx: number;
  active: boolean;
  videoFact: Foundation.VideoFactContent;
  factHash: string;
  range?: [number, number];
  eventHandlers?: WritingEventHandlers;
}
interface EditorVideoBlockState {}

class EditorVideo extends React.Component<
  EditorVideoBlockProps,
  EditorVideoBlockState
> {
  constructor(props: EditorVideoBlockProps) {
    super(props);
  }
  handleClick = () => {
    if (isWriteOnly(this.props.eventHandlers)) {
      this.props.eventHandlers.handleFocus(this.props.idx);
    }
  };
  handleFocus = () => {
    if (isWriteOnly(this.props.eventHandlers)) {
      this.props.eventHandlers.handleFocus(this.props.idx);
    }
  };
  handleKeyDown = (ev: React.KeyboardEvent<HTMLDivElement>) => {
    switch (ev.keyCode) {
      case keycode("enter"):
        if (isWriteOnly(this.props.eventHandlers)) {
          this.props.eventHandlers.handleEnterPress();
        }
        break;
      case keycode("backspace") || keycode("delete"):
        if (isWriteOnly(this.props.eventHandlers)) {
          this.props.eventHandlers.handleDelete(this.props.idx);
        }
        break;
      default:
        break;
    }
  };
  handleSetClick = (range: [number, number]): void => {
    window.location.href =
      Routes.DRAFTS_NEW +
      "/#" +
      this.props.factHash +
      "&" +
      range[0] +
      "&" +
      range[1] +
      window.location.pathname;
  };
  handleVideoEnd = (event: any) => {
    event.target.stopVideo();
  };
  render() {
    const { props } = this;

    let classes = "editor__video-container";

    return (
      <div
        tabIndex={0}
        className={classes}
        onClick={this.handleClick}
        onFocus={this.handleFocus}
        onKeyDown={this.handleKeyDown}
      >
        <Video
          onSetClick={this.handleSetClick}
          videoFact={this.props.videoFact}
          timeRange={this.props.range}
        />
      </div>
    );
  }
}

export default EditorVideoContainer;
