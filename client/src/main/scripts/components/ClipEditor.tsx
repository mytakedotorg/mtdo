import * as React from "react";
import DropDown from "./DropDown";
import ShareClip from "./ShareClip";
import {
  RangeType,
  StateAuthority,
  TimeRange,
  TrackStyles,
  TRACKSTYLES__RANGE
} from "./Video";
import ZoomViewer from "./ZoomViewer";
import TrackSlider, { TrackSliderEventHandlers } from "./TrackSlider";
import { alertErr } from "../utils/functions";

export interface ClipEditorEventHandlers {
  onAfterRangeChange: (
    value: [number, number] | number,
    type: RangeType
  ) => any;
  onClearPress: () => any;
  onPlayPausePress: () => any;
  onRangeChange: (value: [number, number] | number, type: RangeType) => any;
  onRestartPress: () => any;
  onSendToTake: () => any;
  onSkipBackPress: (seconds: number) => any;
  onSkipForwardPress: (seconds: number) => any;
  onZoomToClipPress: () => any;
}

const TRACKSTYLES__SLIDER: TrackStyles = {
  rail: {
    backgroundColor: "#d3dae3" // lighten($base-lightest, 30%)
  },
  track: {
    backgroundColor: "#d3dae3" // lighten($base-lightest, 30%)
  },
  handle: {
    backgroundColor: "#758aa8", // $base--lightest
    border: "1px solid #2c4770" // $base
  }
};

interface ClipEditorProps {
  captionIsHighlighted: boolean;
  currentTime: number;
  videoDuration: number;
  isPaused: boolean;
  isZoomedToClip: boolean;
  eventHandlers: ClipEditorEventHandlers;
  rangeSliders: TimeRange[];
  stateAuthority: StateAuthority;
  videoIdHash: string;
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
  handleBack = () => {
    this.props.eventHandlers.onSkipBackPress(15);
  };
  handleForward = () => {
    this.props.eventHandlers.onSkipForwardPress(15);
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
      styles: TRACKSTYLES__SLIDER,
      label: "Now playing"
    };

    let isZoomed: boolean;

    if (!zoomRange) {
      isZoomed = false;
      zoomRange = {
        start: 0,
        end: props.videoDuration,
        type: "ZOOM",
        styles: TRACKSTYLES__RANGE,
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

    let leftButton;

    if (props.captionIsHighlighted) {
      if (props.isZoomedToClip) {
        leftButton = (
          <button
            className="clipEditor__button clipEditor__button--zoom"
            onClick={this.handleRestart}
          >
            Play Clip
          </button>
        );
      } else {
        leftButton = (
          <button
            className="clipEditor__button clipEditor__button--zoom"
            onClick={props.eventHandlers.onZoomToClipPress}
          >
            Zoom to Clip
          </button>
        );
      }
    } else {
      leftButton = <div className="clipEditor__spacer" />;
    }

    return (
      <div className="clipEditor">
        <div className="clipEditor__actions clipEditor__actions--range">
          <TrackSlider
            start={0}
            end={props.videoDuration}
            eventHandlers={eventHandlers}
            rangeSliders={topTrack}
            stateAuthority={this.props.stateAuthority}
            step={1}
          />
        </div>
        {isZoomed ? (
          <ZoomViewer duration={props.videoDuration} zoomRange={zoomRange} />
        ) : null}
        {isZoomed && typeof zoomRange.end === "number" ? (
          <div className="clipEditor__actions clipEditor__actions--range">
            <TrackSlider
              start={zoomRange.start}
              end={zoomRange.end}
              eventHandlers={eventHandlers}
              rangeSliders={bottomTrack}
              stateAuthority={this.props.stateAuthority}
              step={0.1}
            />
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
            {leftButton}
            <button
              className="clipEditor__button clipEditor__button--small"
              onClick={this.handleBack}
            >
              <i className="fa fa-undo" aria-hidden="true" /> 15s
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
              <i className="fa fa-repeat" aria-hidden="true" /> 15s
            </button>
            {props.captionIsHighlighted && selectionRange.end ? (
              <DropDown
                classModifier="clipShare"
                dropdownPosition="CUSTOM"
                toggleText="Share"
              >
                <ShareClip
                  highlightedRange={[selectionRange.start, selectionRange.end]}
                  onSendToTake={this.props.eventHandlers.onSendToTake}
                  videoIdHash={this.props.videoIdHash}
                  viewRange={
                    zoomRange && zoomRange.end
                      ? [zoomRange.start, zoomRange.end]
                      : undefined
                  }
                />
              </DropDown>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

export default ClipEditor;
