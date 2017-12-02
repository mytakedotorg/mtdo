import * as React from "react";
import * as keycode from "keycode";
import YouTube from "react-youtube";
import Video from "../../Video";
import { VideoBlock } from "../../../java2ts/VideoBlock";
import { isWriteOnly, WritingEventHandlers } from "../";
import { getVideoFact } from "../../../utils/databaseAPI";

interface EditorVideoBlockProps {
  idx: number;
  active: boolean;
  block: VideoBlock;
  eventHandlers?: WritingEventHandlers;
}
interface EditorVideoBlockState {}

class EditorVideoContainer extends React.Component<EditorVideoBlockProps, {}> {
  constructor(props: EditorVideoBlockProps) {
    super(props);
  }
  render() {
    return <EditorVideo {...this.props} />;
  }
}
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
    throw "TODO";
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
          video={getVideoFact(this.props.block.videoId)}
          timeRange={this.props.block.range}
        />
      </div>
    );
  }
}

export default EditorVideoContainer;
