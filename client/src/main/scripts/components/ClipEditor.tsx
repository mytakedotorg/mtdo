import * as React from "react";
import * as ReactDOM from "react-dom";
import { Range } from "rc-slider";
import { convertSecondsToTimestamp } from "../utils/functions";
import isEqual = require("lodash/isEqual");

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
  style: any;
}

class ClipEditor extends React.Component<ClipEditorProps, ClipEditorState> {
  private parentDiv: HTMLDivElement;
  private hiddenDiv: HTMLDivElement;
  constructor(props: ClipEditorProps) {
    super(props);

    this.state = {
      currentTime: props.currentTime,
      selection:
        props.clipEnd > props.clipStart
          ? [props.clipStart, props.clipEnd]
          : [0, props.videoDuration],
      style: {}
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
  resizeCaption = () => {
    const clipStart = this.props.clipStart;
    const clipEnd = this.props.clipEnd;

    // There are 28 words spoken every 10 seconds in Trump/Hillary
    // 25 words every 10 seconds in Carter/Ford
    if (
      clipEnd - clipStart <= 10 && //clip less than 10 seconds
      this.hiddenDiv
    ) {
      const parentWidth = this.parentDiv.offsetWidth;
      const hiddenWidth = this.hiddenDiv.offsetWidth;
      const origFontSize = 15;
      if (hiddenWidth > parentWidth) {
        // set new font size as a proportion of the width of the
        // hidden div with text to the width of the container
        const newFontSize = parentWidth * origFontSize / hiddenWidth;
        this.setState({
          style: {
            fontSize: newFontSize.toString() + "px",
            visibility: "block"
          }
        });
      } else {
        this.setState({
          style: {
            fontSize: origFontSize.toString() + "px",
            display: "block"
          }
        });
      }
    } else {
      this.setState({
        style: { display: "none" }
      });
    }
  };
  componentDidUpdate(prevProps: ClipEditorProps) {
    if (!isEqual(this.props.zoomedRangeData, prevProps.zoomedRangeData)) {
      this.resizeCaption();
    }
  }
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
      <div
        className="clipEditor"
        ref={(parentDiv: HTMLDivElement) => (this.parentDiv = parentDiv)}
      >
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
            <div className="clipEditor__caption">
              <p className="clipEditor__caption-text" style={this.state.style}>
                {this.props.zoomedRangeData.text}
              </p>
              <div
                className="clipEditor__caption-text clipEditor__caption-text--hidden"
                ref={(hiddenDiv: HTMLDivElement) =>
                  (this.hiddenDiv = hiddenDiv)
                }
                style={this.state.style}
              >
                {this.props.zoomedRangeData.text}
              </div>
            </div>
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
