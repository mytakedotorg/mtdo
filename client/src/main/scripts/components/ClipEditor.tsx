import * as React from "react";
import * as ReactDOM from "react-dom";
import { Range } from "rc-slider";
import { convertSecondsToTimestamp } from "../utils/functions";
import isEqual = require("lodash/isEqual");

export interface ClipEditorEventHandlers {
  onClearPress: () => any;
  onFineTuneDown: (rangeIdx: 0 | 1) => void;
  onFineTuneUp: (rangeIdx: 0 | 1) => void;
  onPlayPausePress: () => any;
  onRestartPress: () => any;
  onSelectionRangeChange: (range: [number, number]) => any;
  onSkipBackPress: (seconds: number) => any;
  onSkipForwardPress: (seconds: number) => any;
  onViewRangeChange: (range: [number, number]) => any;
}

type IsChanging = "zoom" | "selection" | "view";

interface ClipEditorProps {
  selection: [number, number];
  view: [number, number];
  currentTime: number;
  videoDuration: number;
  isPaused: boolean;
  eventHandlers: ClipEditorEventHandlers;
}

interface ClipEditorState {
  currentTime: number;
  selection: [number, number];
  view: [number, number];
  zoomedRange?: [number, number];
  isChanging: IsChanging | false;
}

class ClipEditor extends React.Component<ClipEditorProps, ClipEditorState> {
  constructor(props: ClipEditorProps) {
    super(props);

    this.state = {
      currentTime: props.currentTime,
      selection: props.selection ? props.selection : [0, 0],
      view: props.view ? props.view : [0, 0],
      isChanging: false
    };
  }
  getTenPercent = (): number => {
    const duration = this.props.selection[1] - this.props.selection[0];
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
  handleZoomRangeChange = (value: [number, number]) => {
    const { isChanging } = this.state;
    if (isChanging === false || isChanging === "zoom") {
      if (value[0] === 0 && value[1] === this.props.videoDuration) {
        // Zoomed all the way out
        this.setState({
          zoomedRange: undefined
        });
      } else {
        this.setState({
          zoomedRange: value,
          isChanging: "zoom"
        });
      }
    }
  };
  handleAfterZoomRangeChange = (value: [number, number]) => {
    this.setState({
      isChanging: false
    });
  };
  handleSelectionRangeChange = (value: [number, number]) => {
    const { isChanging } = this.state;
    if (isChanging === false || isChanging === "selection") {
      const selectionStart = value[0] >= 0 ? value[0] : this.state.selection[0];
      const selectionEnd = value[1] >= 0 ? value[1] : this.state.selection[1];
      this.setState({
        selection: [selectionStart, selectionEnd],
        isChanging: "selection"
      });
    }
  };
  handleAfterSelectionRangeChange = (value: [number, number]) => {
    this.setState({
      isChanging: false
    });
    this.props.eventHandlers.onSelectionRangeChange(value);
  };
  handleViewRangeChange = (value: [number, number]) => {
    const { isChanging } = this.state;
    if (isChanging === false || isChanging === "view") {
      const fixedDistance = this.state.view[1] - this.state.view[0];
      const viewStart = value[0] >= 0 ? value[0] : this.state.view[0];
      const viewEnd = value[1] >= 0 ? value[1] : this.state.view[1];
      if (viewStart === this.state.view[0] && viewEnd !== this.state.view[1]) {
        // Upper handle is moving
        this.setState({
          view: [viewEnd - fixedDistance, viewEnd],
          isChanging: "view"
        });
      } else if (
        viewStart !== this.state.view[0] &&
        viewEnd === this.state.view[1]
      ) {
        // Lower handle is moving
        this.setState({
          view: [viewStart, viewStart + fixedDistance],
          isChanging: "view"
        });
      }
    }
  };
  handleAfterViewRangeChange = (value: [number, number]) => {
    this.setState({
      isChanging: false
    });
    this.props.eventHandlers.onViewRangeChange(value);
  };
  handleRestart = () => {
    this.props.eventHandlers.onRestartPress();
  };
  componentWillReceiveProps(nextProps: ClipEditorProps) {
    if (
      !isEqual(this.props.selection, nextProps.selection) ||
      !isEqual(this.props.view, nextProps.view)
    ) {
      let selection: [number, number] = [...nextProps.selection] as [
        number,
        number
      ];
      if (typeof selection[0] == "undefined") {
        selection[0] = this.state.selection[0] ? this.state.selection[0] : 0;
      }
      if (typeof selection[1] == "undefined") {
        selection[1] = this.state.selection[1]
          ? this.state.selection[1]
          : this.props.videoDuration;
      }

      let view: [number, number] = [...nextProps.view] as [number, number];
      if (typeof view[0] == "undefined") {
        view[0] = this.state.view[0] ? this.state.view[0] : 0;
      }
      if (typeof view[1] == "undefined") {
        view[1] = this.state.view[1]
          ? this.state.view[1]
          : this.props.videoDuration;
      }
      this.setState({
        currentTime: nextProps.currentTime,
        selection: selection,
        view: view
      });
    } else if (this.props.currentTime !== nextProps.currentTime) {
      this.setState({
        currentTime: nextProps.currentTime
      });
    }
  }
  render() {
    // Can move these calculations to constructor and componentDidUpdate for minor render performance boost
    const wideMin = convertSecondsToTimestamp(0);
    const wideMax = convertSecondsToTimestamp(this.props.videoDuration);
    let zoomStart, zoomEnd;
    if (this.state.zoomedRange) {
      zoomStart = convertSecondsToTimestamp(this.state.zoomedRange[0]);
      zoomEnd = convertSecondsToTimestamp(this.state.zoomedRange[1]);
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
              onChange={this.handleZoomRangeChange}
              onAfterChange={this.handleAfterZoomRangeChange}
              marks={marks}
              step={1}
              value={this.state.zoomedRange}
            />
          </div>
          <p className="clipEditor__text clipEditor__text--max">{wideMax}</p>
        </div>
        {this.state.zoomedRange ? (
          <div>
            <div className="clipEditor__actions clipEditor__actions--range">
              <p className="clipEditor__text clipEditor__text--min">
                {zoomStart}
              </p>
              <div className="clipEditor__range">
                <Range
                  defaultValue={[...this.state.selection]}
                  min={this.state.zoomedRange[0]}
                  max={this.state.zoomedRange[1]}
                  onChange={this.handleSelectionRangeChange}
                  onAfterChange={this.handleAfterSelectionRangeChange}
                  marks={marks}
                  step={0.1}
                  value={[...this.state.selection]}
                />
              </div>
              <p className="clipEditor__text clipEditor__text--max">
                {zoomEnd}
              </p>
            </div>
            <div className="clipEditor__actions clipEditor__actions--range">
              <p className="clipEditor__text clipEditor__text--min">
                {zoomStart}
              </p>
              <div className="clipEditor__range">
                <Range
                  allowCross={false}
                  defaultValue={[...this.state.view]}
                  min={this.state.zoomedRange[0]}
                  max={this.state.zoomedRange[1]}
                  onChange={this.handleViewRangeChange}
                  onAfterChange={this.handleAfterViewRangeChange}
                  marks={marks}
                  step={1}
                  value={[...this.state.view]}
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
