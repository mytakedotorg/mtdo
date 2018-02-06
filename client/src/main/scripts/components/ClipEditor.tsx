import * as React from "react";
import * as ReactDOM from "react-dom";
import { Range } from "rc-slider";
import { RangeSliders, RangeType } from "./Video";
import { convertSecondsToTimestamp } from "../utils/functions";
import isEqual = require("lodash/isEqual");

export interface ClipEditorEventHandlers {
  onAfterRangeChange: (range: [number, number], type: RangeType) => any;
  onClearPress: () => any;
  onFineTuneDown: (rangeIdx: 0 | 1) => void;
  onFineTuneUp: (rangeIdx: 0 | 1) => void;
  onPlayPausePress: () => any;
  onRangeChange: (range: [number, number], type: RangeType) => any;
  onRestartPress: () => any;
  onSkipBackPress: (seconds: number) => any;
  onSkipForwardPress: (seconds: number) => any;
}

type IsChanging = "zoom" | "selection" | "view";

interface ClipEditorProps {
  selection: [number, number];
  currentTime: number;
  videoDuration: number;
  isPaused: boolean;
  eventHandlers: ClipEditorEventHandlers;
  rangeSliders: RangeSliders;
}

interface ClipEditorState {}

class ClipEditor extends React.Component<ClipEditorProps, ClipEditorState> {
  constructor(props: ClipEditorProps) {
    super(props);
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
    let zoomStart, zoomEnd;
    let zoomStartPretty, zoomEndPretty;
    if (props.rangeSliders.zoomedRange) {
      zoomStart = props.rangeSliders.zoomedRange.start;
      zoomEnd = props.rangeSliders.zoomedRange.end;
      zoomStartPretty = convertSecondsToTimestamp(zoomStart);
      zoomEndPretty = convertSecondsToTimestamp(zoomEnd);

      if (props.selection[0] < zoomStart) {
        selectionStart = zoomStart;
      } else {
        selectionStart = props.selection[0];
      }

      if (props.selection[1] > zoomEnd) {
        selectionEnd = zoomEnd;
      } else {
        selectionEnd = props.selection[1];
      }

      if (props.rangeSliders.transcriptViewRange.start < zoomStart) {
        viewStart = zoomStart;
      } else {
        viewStart = props.rangeSliders.transcriptViewRange.start;
      }

      if (props.rangeSliders.transcriptViewRange.end > zoomEnd) {
        viewEnd = zoomEnd;
      } else {
        viewEnd = props.rangeSliders.transcriptViewRange.end;
      }
    }
    const marks = {
      [props.currentTime]: convertSecondsToTimestamp(props.currentTime)
    };

    const topRangeMarks = {
      [props.rangeSliders.transcriptViewRange.start]: "view",
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
                props.rangeSliders.zoomedRange
                  ? [zoomStart, zoomEnd]
                  : [0, props.videoDuration]
              }
            />
          </div>
          <p className="clipEditor__text clipEditor__text--max">{wideMax}</p>
        </div>
        {props.rangeSliders.zoomedRange ? (
          <div>
            <div className="clipEditor__actions clipEditor__actions--range">
              <p className="clipEditor__text clipEditor__text--min">
                {zoomStartPretty}
              </p>
              <div className="clipEditor__range">
                <Range
                  defaultValue={[selectionStart, selectionEnd]}
                  min={zoomStart}
                  max={zoomEnd}
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
                  min={zoomStart}
                  max={zoomEnd}
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
