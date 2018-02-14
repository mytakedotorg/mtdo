import * as React from "react";
import * as ReactDOM from "react-dom";
import { Range } from "rc-slider";
import { RangeType, TimeRange, TRACKSTYLES__ZOOM } from "./Video";
import TrackSlider, { TrackSliderEventHandlers } from "./TrackSlider";
import { alertErr, convertSecondsToTimestamp } from "../utils/functions";
import isEqual = require("lodash/isEqual");

export interface ClipEditorEventHandlers {
  onAfterRangeChange: (
    value: [number, number] | number,
    type: RangeType
  ) => any;
  onClearPress: () => any;
  onPlayPausePress: () => any;
  onRangeChange: (value: [number, number] | number, type: RangeType) => any;
  onRestartPress: () => any;
  onSkipBackPress: (seconds: number) => any;
  onSkipForwardPress: (seconds: number) => any;
}

type IsChanging = "zoom" | "selection" | "view";

interface ClipEditorProps {
  currentTime: number;
  videoDuration: number;
  isPaused: boolean;
  eventHandlers: ClipEditorEventHandlers;
  rangeSliders: TimeRange[];
}

interface ClipEditorState {}

class ClipEditor extends React.Component<ClipEditorProps, ClipEditorState> {
  private timerId: number | null;
  constructor(props: ClipEditorProps) {
    super(props);
  }
  clearTimer = () => {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  };
  getRangeSlider = (
    type: RangeType,
    rangeSliders: TimeRange[]
  ): TimeRange | null => {
    for (const rangeSlider of rangeSliders) {
      if (rangeSlider.type === type) {
        return { ...rangeSlider };
      }
    }
    return null;
  };
  getTenPercent = (): number => {
    const selectionRange = this.getRangeSlider(
      "SELECTION",
      this.props.rangeSliders
    );
    let duration;
    if (selectionRange && typeof selectionRange.end === "number") {
      duration = selectionRange.end - selectionRange.start;
    } else {
      duration = this.props.videoDuration;
    }
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
  handleRangeChange = (value: [number, number] | number, type: RangeType) => {
    // Throttle the event a bit
    if (!this.timerId) {
      this.props.eventHandlers.onRangeChange(value, type);
      this.timerId = window.setTimeout(this.clearTimer, 16.67); // 60hz
    }
  };
  handleRestart = () => {
    this.props.eventHandlers.onRestartPress();
  };
  render() {
    const { props } = this;
    // Can move these calculations to constructor and componentDidUpdate for minor render performance boost

    let selectionRange = this.getRangeSlider("SELECTION", props.rangeSliders);
    let viewRange = this.getRangeSlider("VIEW", props.rangeSliders);
    let zoomRange = this.getRangeSlider("ZOOM", props.rangeSliders);
    let currentTime: TimeRange = {
      start: props.currentTime,
      type: "CURRENT_TIME",
      styles: TRACKSTYLES__ZOOM,
      label: "Now playing"
    };

    let isZoomed: boolean;

    if (!zoomRange) {
      isZoomed = false;
      zoomRange = {
        start: 0,
        end: props.videoDuration,
        type: "ZOOM",
        styles: TRACKSTYLES__ZOOM,
        label: "Zoom"
      };
    } else {
      isZoomed = true;
    }

    if (!viewRange || !selectionRange) {
      const msg = "ClipEditor: view and selection ranges are required";
      alertErr(msg);
      throw msg;
    }

    const eventHandlers: TrackSliderEventHandlers = {
      onAfterRangeChange: this.props.eventHandlers.onAfterRangeChange,
      onRangeChange: this.handleRangeChange
    };

    const topTrack: TimeRange[] = [currentTime, viewRange, zoomRange];
    const bottomTrack: TimeRange[] = [currentTime, viewRange, selectionRange];

    return (
      <div className="clipEditor">
        <div className="clipEditor__actions clipEditor__actions--range">
          <TrackSlider
            start={0}
            end={props.videoDuration}
            eventHandlers={eventHandlers}
            rangeSliders={topTrack}
            step={1}
          />
        </div>
        {isZoomed && typeof zoomRange.end === "number" ? (
          <div>
            <div className="clipEditor__actions clipEditor__actions--range">
              <TrackSlider
                start={zoomRange.start}
                end={zoomRange.end}
                eventHandlers={eventHandlers}
                rangeSliders={bottomTrack}
                step={0.1}
              />
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
              {props.isPaused ? (
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
