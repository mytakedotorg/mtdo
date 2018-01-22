import * as React from "react";
import * as ReactDOM from "react-dom";
import { Range } from "rc-slider";
import { convertSecondsToTimestamp } from "../utils/functions";

export interface ClipEditorEventHandlers {
  onClearPress: () => any;
  onPlayPausePress: () => any;
  onRangeChange: (range: [number, number], rangeIsMax: boolean) => any;
  onRestartPress: () => any;
  onFineTuneUp: (rangeIdx: 0 | 1) => void;
  onFineTuneDown: (rangeIdx: 0 | 1) => void;
}

interface ClipEditorProps {
  clipStart: number;
  clipEnd: number;
  currentTime: number;
  videoDuration: number;
  isPaused: boolean;
  eventHandlers: ClipEditorEventHandlers;
}

interface ClipEditorState {
  isZoomed: boolean;
  min: number;
  max: number;
  rangeIsSet: boolean;
}

class ClipEditor extends React.Component<ClipEditorProps, ClipEditorState> {
  constructor(props: ClipEditorProps) {
    super(props);

    this.state = {
      isZoomed: false,
      min: 0,
      max: props.videoDuration,
      rangeIsSet: false
    };
  }
  handleBack = () => {
    console.log("back");
  };
  handleForward = () => {
    console.log("forward");
  };
  handlePlayPause = () => {
    this.props.eventHandlers.onPlayPausePress();
  };
  handleRangeChange = (value: [number, number]) => {
    let rangeIsSet;
    if (value[0] === 0 && value[1] === this.props.videoDuration) {
      // Range reset to max
      rangeIsSet = false;
    } else {
      rangeIsSet = true;
    }
    this.props.eventHandlers.onRangeChange(value, !rangeIsSet);
    this.setState({
      rangeIsSet: rangeIsSet
    });
  };
  handleRestart = () => {
    this.props.eventHandlers.onRestartPress();
  };
  handleZoomIn = () => {
    this.setState({
      isZoomed: true
    });
  };
  handleZoomOut = () => {
    this.setState({
      isZoomed: false
    });
  };
  render() {
    const min = convertSecondsToTimestamp(
      this.state.isZoomed ? this.props.clipStart : this.state.min
    );
    const max = convertSecondsToTimestamp(
      this.state.isZoomed ? this.props.clipEnd : this.state.max
    );
    const startTime = convertSecondsToTimestamp(this.props.clipStart);
    const endTime = convertSecondsToTimestamp(this.props.clipEnd);
    const marks = {
      [this.props.currentTime]: convertSecondsToTimestamp(
        this.props.currentTime
      )
    };
    return (
      <div className="clipEditor">
        <div className="clipEditor__actions clipEditor__actions--range">
          <Range
            defaultValue={[0, this.state.max]}
            min={
              this.state.isZoomed ? this.props.clipStart - 15 : this.state.min
            }
            max={this.state.isZoomed ? this.props.clipEnd + 15 : this.state.max}
            onAfterChange={this.handleRangeChange}
            marks={marks}
          />
        </div>
        <div className="clipEditor__actions clipEditor__actions--zoom">
          {this.state.rangeIsSet ? (
            <div>
              <button
                className="clipEditor__button clipEditor__button--small"
                onClick={this.handleZoomOut}
                disabled={!this.state.isZoomed}
              >
                <i className="fa fa-search-minus" aria-hidden="true" />
              </button>
              <button
                className="clipEditor__button clipEditor__button--small"
                onClick={this.handleZoomIn}
              >
                <i className="fa fa-search-plus" aria-hidden="true" />
              </button>
            </div>
          ) : (
            <p className="clipEditor__text clipEditor__text--zoom">
              Drag the range handles to create a clip
            </p>
          )}
        </div>
        <div className="clipEditor__actions clipEditor__actions--controls">
          <p className="clipEditor__text clipEditor__text--min">{min}</p>
          <div className="clipEditor__controls">
            <button
              className="clipEditor__button clipEditor__button--small"
              onClick={this.handleRestart}
            >
              <i className="fa fa-fast-backward" aria-hidden="true" />
            </button>
            <button
              className="clipEditor__button clipEditor__button--small"
              onClick={this.handleBack}
            >
              <i className="fa fa-undo" aria-hidden="true" />
            </button>
            <button
              className="clipEditor__button clipEditor__button--small"
              onClick={this.handlePlayPause}
            >
              {this.props.isPaused ? (
                <i className="fa fa-play" aria-hidden="true" />
              ) : (
                <i className="fa fa-pause" aria-hidden="true" />
              )}
            </button>
            <button
              className="clipEditor__button clipEditor__button--small"
              onClick={this.handleForward}
            >
              <i className="fa fa-repeat" aria-hidden="true" />
            </button>
          </div>
          <p className="clipEditor__text clipEditor__text--max">{max}</p>
        </div>
      </div>
    );
  }
}

export default ClipEditor;
