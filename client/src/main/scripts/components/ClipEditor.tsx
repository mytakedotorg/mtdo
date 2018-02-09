import * as React from "react";
import * as ReactDOM from "react-dom";
import { Range } from "rc-slider";
import { RangeType, TimeRange } from "./Video";
import { alertErr, convertSecondsToTimestamp } from "../utils/functions";
import isEqual = require("lodash/isEqual");

export interface ClipEditorEventHandlers {
  onAfterRangeChange: (range: [number, number], type: RangeType) => any;
  onClearPress: () => any;
  onPlayPausePress: () => any;
  onRangeChange: (range: [number, number], type: RangeType) => any;
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
  constructor(props: ClipEditorProps) {
    super(props);
  }
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
    if (selectionRange) {
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
  handleZoomRangeChange = (value: [number, number]) => {
    this.props.eventHandlers.onRangeChange(value, "ZOOM");
  };
  handleAfterZoomRangeChange = (value: [number, number]) => {
    this.props.eventHandlers.onAfterRangeChange(value, "ZOOM");
  };
  handleSelectionRangeChange = (value: [number, number]) => {
    this.props.eventHandlers.onRangeChange(value, "SELECTION");
  };
  handleAfterSelectionRangeChange = (value: [number, number]) => {
    this.props.eventHandlers.onAfterRangeChange(value, "SELECTION");
  };
  handleViewRangeChange = (value: [number, number]) => {
    this.props.eventHandlers.onRangeChange(value, "VIEW");
  };
  handleAfterViewRangeChange = (value: [number, number]) => {
    this.props.eventHandlers.onAfterRangeChange(value, "VIEW");
  };
  handleRestart = () => {
    this.props.eventHandlers.onRestartPress();
  };
  render() {
    const { props } = this;
    // Can move these calculations to constructor and componentDidUpdate for minor render performance boost
    const wideMin = convertSecondsToTimestamp(0);
    const wideMax = convertSecondsToTimestamp(this.props.videoDuration);

    let selectionStart, selectionEnd;
    let viewStart, viewEnd;
    let zoomStartPretty, zoomEndPretty;

    const zoomedRange = this.getRangeSlider("ZOOM", this.props.rangeSliders);
    const selectionRange = this.getRangeSlider(
      "SELECTION",
      this.props.rangeSliders
    );
    const transcriptViewRange = this.getRangeSlider(
      "VIEW",
      this.props.rangeSliders
    );

    if (zoomedRange && selectionRange && transcriptViewRange) {
      zoomStartPretty = convertSecondsToTimestamp(zoomedRange.start);
      zoomEndPretty = convertSecondsToTimestamp(zoomedRange.end);

      if (selectionRange.start < zoomedRange.start) {
        selectionStart = zoomedRange.start;
      } else {
        selectionStart = selectionRange.start;
      }

      if (selectionRange.end > zoomedRange.end) {
        selectionEnd = zoomedRange.end;
      } else {
        selectionEnd = selectionRange.end;
      }

      if (transcriptViewRange.start < zoomedRange.start) {
        viewStart = zoomedRange.start;
      } else {
        viewStart = transcriptViewRange.start;
      }

      if (transcriptViewRange.end > zoomedRange.end) {
        viewEnd = zoomedRange.end;
      } else {
        viewEnd = transcriptViewRange.end;
      }
    }
    const marks = {
      [props.currentTime]: convertSecondsToTimestamp(props.currentTime)
    };

    let topRangeMarks = {};
    if (transcriptViewRange) {
      topRangeMarks = {
        [transcriptViewRange.start]: "view"
      };
    }
    topRangeMarks = {
      ...topRangeMarks,
      ...marks
    };

    return (
      <div className="clipEditor">
        <div className="clipEditor__actions clipEditor__actions--range">
          <p className="clipEditor__text clipEditor__text--min">{wideMin}</p>
          <div className="clipEditor__range">
            <Range
              defaultValue={[0, props.videoDuration]}
              min={0}
              max={props.videoDuration}
              onChange={this.handleZoomRangeChange}
              onAfterChange={this.handleAfterZoomRangeChange}
              marks={topRangeMarks}
              step={1}
              value={
                zoomedRange
                  ? [zoomedRange.start, zoomedRange.end]
                  : [0, props.videoDuration]
              }
            />
          </div>
          <p className="clipEditor__text clipEditor__text--max">{wideMax}</p>
        </div>
        {zoomedRange ? (
          <div>
            <div className="clipEditor__actions clipEditor__actions--range">
              <p className="clipEditor__text clipEditor__text--min">
                {zoomStartPretty}
              </p>
              <div className="clipEditor__range">
                <Range
                  defaultValue={[selectionStart, selectionEnd]}
                  min={zoomedRange.start}
                  max={zoomedRange.end}
                  onChange={this.handleSelectionRangeChange}
                  onAfterChange={this.handleAfterSelectionRangeChange}
                  marks={marks}
                  step={0.1}
                  value={[selectionStart, selectionEnd]}
                />
              </div>
              <p className="clipEditor__text clipEditor__text--max">
                {zoomEndPretty}
              </p>
            </div>
            <div className="clipEditor__actions clipEditor__actions--range">
              <p className="clipEditor__text clipEditor__text--min">
                {zoomStartPretty}
              </p>
              <div className="clipEditor__range">
                <Range
                  defaultValue={[viewStart, viewEnd]}
                  min={zoomedRange.start}
                  max={zoomedRange.end}
                  onChange={this.handleViewRangeChange}
                  onAfterChange={this.handleAfterViewRangeChange}
                  marks={marks}
                  step={0.1}
                  value={[viewStart, viewEnd]}
                />
              </div>
              <p className="clipEditor__text clipEditor__text--max">
                {zoomEndPretty}
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
