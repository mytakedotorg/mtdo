import * as React from "react";
import * as ReactDOM from "react-dom";
import { Range } from "rc-slider";
import { convertSecondsToTimestamp } from "../utils/functions";

export interface ClipEditorEventHandlers {
  onClearPress: () => any;
  onPlayPausePress: () => any;
  onRangeChange: (range: [number, number, number], rangeIsMax: boolean) => any;
  onRestartPress: () => any;
  onSkipBackPress: (seconds: number) => any;
  onSkipForwardPress: (seconds: number) => any;
  onFineTuneUp: (rangeIdx: 0 | 1) => void;
  onFineTuneDown: (rangeIdx: 0 | 1) => void;
}

export interface ZoomedRangeData {
  viewRange: [number, number];
  text: string;
}

interface ClipEditorProps {
  clipStart: number;
  clipEnd: number;
  currentTime: number;
  videoDuration: number;
  isPaused: boolean;
  eventHandlers: ClipEditorEventHandlers;
  zoomedRangeData?: ZoomedRangeData;
}

interface ClipEditorState {
  currentTime: number;
  selection: [number, number];
}

class ClipEditor extends React.Component<ClipEditorProps, ClipEditorState> {
  constructor(props: ClipEditorProps) {
    super(props);

    this.state = {
      currentTime: props.currentTime,
      selection:
        props.clipEnd > props.clipStart
          ? [props.clipStart, props.clipEnd]
          : [0, props.videoDuration]
    };
  }
  getTenPercent = (): number => {
    const duration = this.props.clipEnd - this.props.clipStart;
    return duration * 0.1;
  };
  handleBack = () => {
    this.props.eventHandlers.onSkipBackPress(this.getTenPercent());
  };
  handleForward = () => {
    this.props.eventHandlers.onSkipForwardPress(this.getTenPercent());
  };
  handlePlayPause = () => {
    this.props.eventHandlers.onPlayPausePress();
  };
  handleRangeChange = (value: [number, number, number]) => {
    this.setState({
      currentTime: value[1],
      selection: [value[0], value[2]]
    });
  };
  handleAfterRangeChange = (value: [number, number, number]) => {
    let rangeIsSet;
    if (value[0] === 0 && value[2] === this.props.videoDuration) {
      // Range reset to max
      rangeIsSet = false;
    } else {
      rangeIsSet = true;
    }
    this.props.eventHandlers.onRangeChange(value, !rangeIsSet);
  };
  handleRestart = () => {
    this.props.eventHandlers.onRestartPress();
  };
  componentWillReceiveProps(nextProps: ClipEditorProps) {
    if (
      ((nextProps.clipStart !== this.state.selection[0] ||
        nextProps.clipEnd !== this.state.selection[1]) &&
        nextProps.clipEnd > nextProps.clipStart) ||
      nextProps.currentTime !== this.state.currentTime
    ) {
      this.setState({
        selection: [nextProps.clipStart, nextProps.clipEnd],
        currentTime: nextProps.currentTime
      });
    }
  }
  render() {
    const wideMin = convertSecondsToTimestamp(0);
    const wideMax = convertSecondsToTimestamp(this.props.videoDuration);
    let zoomStart, zoomEnd;
    if (this.props.zoomedRangeData) {
      zoomStart = convertSecondsToTimestamp(
        this.props.zoomedRangeData.viewRange[0]
      );
      zoomEnd = convertSecondsToTimestamp(
        this.props.zoomedRangeData.viewRange[1]
      );
    }
    const marks = {
      [this.props.currentTime]: convertSecondsToTimestamp(
        this.props.currentTime
      )
    };
    return (
      <div className="clipEditor">
        <div className="clipEditor__actions clipEditor__actions--range">
          <p className="clipEditor__text clipEditor__text--min">{wideMin}</p>
          <div className="clipEditor__range">
            <Range
              defaultValue={[0, this.props.videoDuration]}
              min={0}
              max={this.props.videoDuration}
              onChange={this.handleRangeChange}
              onAfterChange={this.handleAfterRangeChange}
              marks={marks}
              step={1}
              value={[
                this.state.selection[0],
                this.state.currentTime,
                this.state.selection[1]
              ]}
            />
          </div>
          <p className="clipEditor__text clipEditor__text--max">{wideMax}</p>
        </div>
        {this.props.zoomedRangeData ? (
          <div>
            <p className="clipEditor__text">
              {this.props.zoomedRangeData.text}
            </p>
            <div className="clipEditor__actions clipEditor__actions--range">
              <p className="clipEditor__text clipEditor__text--min">
                {zoomStart}
              </p>
              <div className="clipEditor__range">
                <Range
                  defaultValue={[this.props.clipStart, this.props.clipEnd]}
                  min={this.props.zoomedRangeData.viewRange[0]}
                  max={this.props.zoomedRangeData.viewRange[1]}
                  onChange={this.handleRangeChange}
                  onAfterChange={this.handleAfterRangeChange}
                  marks={marks}
                  step={0.1}
                  value={[
                    this.state.selection[0],
                    this.state.currentTime,
                    this.state.selection[1]
                  ]}
                />
              </div>
              <p className="clipEditor__text clipEditor__text--max">
                {zoomEnd}
              </p>
            </div>
          </div>
        ) : (
          <div className="clipEditor__actions clipEditor__actions--range">
            <p className="clipEditor__text clipEditor__text--range">
              Drag the range handles to create a clip
            </p>
          </div>
        )}

        <div className="clipEditor__actions clipEditor__actions--controls">
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
        </div>
      </div>
    );
  }
}

export default ClipEditor;
