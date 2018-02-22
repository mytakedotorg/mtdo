import * as React from "react";
import YouTube from "react-youtube";
import isEqual = require("lodash/isEqual");
import { alertErr, getCharRangeFromVideoRange } from "../utils/functions";
import { Foundation } from "../java2ts/Foundation";
import CaptionView, { CaptionViewEventHandlers } from "./CaptionView";
import { Routes } from "../java2ts/Routes";

interface YTPlayerParameters {
  rel: number;
  cc_load_policy: number;
  cc_lang_pref: string;
  controls: number;
  start?: number;
  end?: number | null;
  autoplay: number;
  showinfo: number;
  modestbranding: number;
  playsinline: 1;
}

export interface TimeRange {
  start: number;
  end?: number;
  type: RangeType;
  styles: TrackStyles;
  label: string;
}

export interface TrackStyles {
  rail: stylesObject;
  track: stylesObject;
  handle: stylesObject;
}

interface stylesObject {
  [key: string]: string;
}

export const TRACKSTYLES__RANGE: TrackStyles = {
  rail: {
    backgroundColor: "#d3dae3" // lighten($base-lightest, 30%)
  },
  track: {
    backgroundColor: "#758aa8" // $base--lightest
  },
  handle: {
    backgroundColor: "#758aa8", // $base--lightest
    border: "1px solid #2c4770" // $base
  }
};

export type RangeType = "SELECTION" | "VIEW" | "ZOOM" | "CURRENT_TIME";

interface VideoProps {
  onSetClick: (range: [number, number]) => void;
  onRangeSet?: (videoRange: [number, number]) => void;
  onClearClick?: () => void;
  videoFact: Foundation.VideoFactContentFast;
  className?: string;
  clipRange?: [number, number] | null;
}

interface VideoState {
  currentTime: number;
  duration: number;
  isPaused: boolean;
  isZoomedToClip: boolean;
  captionIsHighlighted: boolean;
  highlightedCharRange: [number, number];
  rangeSliders: TimeRange[];
  rangeIsChanging: RangeType | null;
}

class Video extends React.Component<VideoProps, VideoState> {
  private timerId: number | null;
  private scrollTimer: number | null;
  private player: any;
  private viewRangeDuration: number;
  private playerVars: YTPlayerParameters;
  constructor(props: VideoProps) {
    super(props);

    let charRange: [number, number] = this.getCharRange(
      props.videoFact,
      props.clipRange
    );

    this.playerVars = {
      rel: 0,
      cc_load_policy: 1,
      cc_lang_pref: "en",
      controls: 0,
      playsinline: 1,
      autoplay: 1,
      showinfo: 0,
      modestbranding: 1,
      start: props.clipRange ? props.clipRange[0] : 0,
      end: props.clipRange ? props.clipRange[1] : null
    };

    this.viewRangeDuration = 5;

    this.state = {
      currentTime: props.clipRange ? props.clipRange[0] : 0,
      isPaused: true,
      isZoomedToClip: props.clipRange ? true : false,
      duration: 5224,
      captionIsHighlighted: props.clipRange ? true : false,
      highlightedCharRange: charRange,
      rangeSliders: this.initializeRangeSliders(props),
      rangeIsChanging: null
    };
  }
  cueVideo = () => {
    if (this.player) {
      const selectionRange = this.getRangeSlider("SELECTION");
      if (selectionRange) {
        this.player.cueVideoById({
          videoId: this.props.videoFact.youtubeId,
          startSeconds: selectionRange.start,
          endSeconds: selectionRange.end,
          suggestedQuality: "default"
        });
        this.playerVars.start = selectionRange.start;
        this.playerVars.end = selectionRange.end;
      } else {
        const msg = "Video: Can't find selection range. (1)";
        alertErr(msg);
        throw msg;
      }
    }
  };
  getCharRange = (
    videoFact: Foundation.VideoFactContentFast,
    timeRange?: [number, number] | null
  ): [number, number] => {
    if (timeRange) {
      if (videoFact.charOffsets && videoFact.timestamps) {
        const charRange = getCharRangeFromVideoRange(
          videoFact.charOffsets,
          videoFact.timestamps,
          timeRange
        );
        return charRange;
      } else {
        console.warn("Captions not yet done for this video");
      }
    }
    return [-1, -1];
  };
  getRangeSlider = (type: RangeType): TimeRange | null => {
    for (const rangeSlider of this.state.rangeSliders) {
      if (rangeSlider.type === type) {
        return { ...rangeSlider };
      }
    }
    return null;
  };
  initializeRangeSliders = (props: VideoProps): TimeRange[] => {
    const transcriptViewRange: TimeRange = {
      start: 0,
      end: this.viewRangeDuration,
      type: "VIEW",
      styles: TRACKSTYLES__RANGE,
      label: "Transcript"
    };

    const selectionRange: TimeRange = {
      start: props.clipRange ? props.clipRange[0] : 0,
      end: props.clipRange ? props.clipRange[1] : 0,
      type: "SELECTION",
      styles: TRACKSTYLES__RANGE,
      label: "Clip"
    };

    if (props.clipRange) {
      const tenPercent = (props.clipRange[1] - props.clipRange[0]) * 0.1;
      const zoomRange: TimeRange = {
        start: props.clipRange[0] - tenPercent,
        end: props.clipRange[1] + tenPercent,
        type: "ZOOM",
        styles: TRACKSTYLES__RANGE,
        label: "Zoom"
      };
      return [transcriptViewRange, selectionRange, zoomRange];
    }

    return [transcriptViewRange, selectionRange];
  };
  handleCaptionHighlight = (
    videoRange: [number, number],
    charRange: [number, number]
  ): void => {
    //Set video times
    const newSelection: TimeRange = {
      start: videoRange[0],
      end: videoRange[1],
      type: "SELECTION",
      styles: TRACKSTYLES__RANGE,
      label: "Clip"
    };
    this.setState({
      captionIsHighlighted: true,
      highlightedCharRange: charRange,
      rangeSliders: this.updateRangeSlider(newSelection)
    });
    if (this.props.onRangeSet) {
      this.props.onRangeSet([videoRange[0], videoRange[1]]);
    }
  };
  handleCaptionScroll = (viewRange: [number, number]) => {
    if (this.state.rangeIsChanging == null) {
      // Don't let this fire if the range sliders are being changed
      const newView: TimeRange = {
        start: viewRange[0],
        end: viewRange[1],
        type: "VIEW",
        styles: TRACKSTYLES__RANGE,
        label: "Transcript"
      };

      if (this.scrollTimer) {
        window.clearTimeout(this.scrollTimer);
      }
      this.scrollTimer = window.setTimeout(this.handleCaptionScrollEnd, 500);

      this.setState({
        rangeSliders: this.updateRangeSlider(newView)
      });
    }
  };
  handleCaptionScrollEnd = () => {
    this.scrollTimer = null;
  };
  handleClearClick = (): void => {
    this.setState({
      captionIsHighlighted: false
    });
    if (this.props.onClearClick) {
      this.props.onClearClick();
    }
  };
  handlePlayPausePress = () => {
    // External play/pause button was pressed
    const isPaused = this.state.isPaused;
    if (isPaused) {
      if (this.player) {
        this.player.playVideo();
      }
    } else {
      if (this.player) {
        this.player.pauseVideo();
      }
    }
    this.setState({
      isPaused: !isPaused
    });
  };
  handlePause = (event: any) => {
    // Player was paused with player controls
    this.setState({
      currentTime: Math.round(event.target.getCurrentTime())
    });
  };
  handleAfterRangeChange = (
    value: [number, number] | number,
    type: RangeType
  ) => {
    this.setState({
      rangeIsChanging: null
    });
    if (type === "SELECTION" && typeof value === "object") {
      if (this.props.onRangeSet) {
        this.props.onRangeSet([value[0], value[1]]);
      }
    }
  };
  handleRangeChange = (value: [number, number] | number, type: RangeType) => {
    const { rangeIsChanging } = this.state;
    if (
      this.scrollTimer == null && // Don't let this fire if the transcript is being scrolled
      (rangeIsChanging == null || rangeIsChanging === type)
    ) {
      const zoomedRange = this.getRangeSlider("ZOOM");
      const selectionRange = this.getRangeSlider("SELECTION");
      switch (type) {
        case "SELECTION":
          if (selectionRange && zoomedRange) {
            if (
              typeof selectionRange.end !== "number" ||
              typeof value !== "object"
            ) {
              const msg = "Video.tsx. Expect SELECTION range to have an end";
              alertErr(msg);
              throw msg;
            }
            if (typeof zoomedRange.end !== "number") {
              const msg = "Video.tsx. Expect ZOOM range to have an end";
              alertErr(msg);
              throw msg;
            }
            // Determine which handle is being changed
            let nextSelectionStart;
            let nextSelectionEnd;
            if (
              value[0] !== selectionRange.start &&
              value[0] !== zoomedRange.start
            ) {
              // Lower handle is being changed
              nextSelectionStart = Math.max(value[0], zoomedRange.start + 0.1);
              nextSelectionEnd = selectionRange.end;
            } else if (
              value[1] !== selectionRange.end &&
              value[1] !== zoomedRange.end
            ) {
              // Upper handle is being changed
              nextSelectionStart = selectionRange.start;
              nextSelectionEnd = Math.min(value[1], zoomedRange.end - 0.1);
            } else {
              // Selection matches zoom range
              if (value[0] % 1 === 0 && value[1] % 1 !== 0) {
                // Lower handle is a whole number, upper handle isn't
                // Lower handle is moving
                // Lower handle is being changed
                nextSelectionStart = Math.max(
                  value[0],
                  zoomedRange.start + 0.1
                );
                nextSelectionEnd = selectionRange.end;
              } else if (value[0] % 1 !== 0 && value[1] % 1 === 0) {
                // Upper handle is a whole number, lower handle isn't
                // Upper handle is moving
                nextSelectionStart = selectionRange.start;
                nextSelectionEnd = Math.min(value[1], zoomedRange.end - 0.1);
              } else {
                const msg =
                  "Video: Can't determine which selection handle is changing.";
                alertErr(msg);
                throw msg;
              }
            }
            const nextSelection: TimeRange = {
              start: nextSelectionStart,
              end: nextSelectionEnd,
              type: "SELECTION",
              styles: TRACKSTYLES__RANGE,
              label: "Clip"
            };
            const charRange: [number, number] = this.getCharRange(
              this.props.videoFact,
              [nextSelectionStart, nextSelectionEnd]
            );
            this.setState({
              captionIsHighlighted: true,
              highlightedCharRange: charRange,
              isZoomedToClip: zoomedRange.end
                ? this.isZoomedToClip(
                    [nextSelectionStart, nextSelectionEnd],
                    [zoomedRange.start, zoomedRange.end]
                  )
                : false,
              rangeIsChanging: "SELECTION",
              rangeSliders: this.updateRangeSlider(nextSelection)
            });
          } else {
            const msg = "Video: Can't find selection or zoom range.";
            alertErr(msg);
            throw msg;
          }
          break;
        case "VIEW":
          const transcriptViewRange = this.getRangeSlider("VIEW");
          if (transcriptViewRange) {
            // Determine which handle is being changed
            let nextViewStart;
            let nextViewEnd;
            if (
              typeof transcriptViewRange.end !== "number" ||
              typeof value !== "object"
            ) {
              const msg = "Video.tsx. Expect VIEW range to have an end";
              alertErr(msg);
              throw msg;
            }
            if (value[0] !== transcriptViewRange.start) {
              if (zoomedRange) {
                if (value[0] !== zoomedRange.start) {
                  // Lower handle is being changed
                  nextViewStart = value[0];
                  nextViewEnd = value[0] + this.viewRangeDuration;
                } else {
                  // Upper handle is being changed
                  nextViewStart = value[1] - this.viewRangeDuration;
                  nextViewEnd = value[1];
                }
              } else {
                // Lower handle is being changed
                nextViewStart = value[0];
                nextViewEnd = value[0] + this.viewRangeDuration;
              }
            } else if (value[1] !== transcriptViewRange.end) {
              if (zoomedRange) {
                if (value[1] !== zoomedRange.end) {
                  // Upper handle is being changed
                  nextViewStart = value[1] - this.viewRangeDuration;
                  nextViewEnd = value[1];
                } else {
                  // Lower handle is being changed
                  nextViewStart = value[0];
                  nextViewEnd = value[0] + this.viewRangeDuration;
                }
              } else {
                // Upper handle is being changed
                nextViewStart = value[1] - this.viewRangeDuration;
                nextViewEnd = value[1];
              }
            } else {
              const msg =
                "Video: Can't determine which view handle is changing.";
              alertErr(msg);
              throw msg;
            }
            const nextView: TimeRange = {
              start: nextViewStart,
              end: nextViewEnd,
              type: "VIEW",
              styles: TRACKSTYLES__RANGE,
              label: "Transcript"
            };
            this.setState({
              rangeIsChanging: "VIEW",
              rangeSliders: this.updateRangeSlider(nextView)
            });
          } else {
            const msg = "Video: Can't find view range.";
            alertErr(msg);
            throw msg;
          }
          break;
        case "ZOOM":
          if (typeof value !== "object") {
            const msg = "Video.tsx. Expect ZOOM range to be an array";
            alertErr(msg);
            throw msg;
          }
          const nextZoom: TimeRange = {
            start: value[0],
            end: value[1],
            type: "ZOOM",
            styles: TRACKSTYLES__RANGE,
            label: "Zoom"
          };
          this.setState({
            isZoomedToClip:
              selectionRange && selectionRange.end
                ? this.isZoomedToClip(
                    [selectionRange.start, selectionRange.end],
                    [value[0], value[1]]
                  )
                : false,
            rangeIsChanging: "ZOOM",
            rangeSliders: this.updateRangeSlider(nextZoom)
          });
          break;
        case "CURRENT_TIME":
          if (typeof value !== "number") {
            const msg = "Video.tsx. Expect CURRENT_TIME value to be a number";
            alertErr(msg);
            throw msg;
          }
          if (
            zoomedRange &&
            zoomedRange.end &&
            Math.round(value) === Math.round(zoomedRange.end)
          ) {
            // Now playing has reached the end of the zoom range, let it continue by doing nothing
          } else {
            if (selectionRange && selectionRange.end) {
              if (value >= selectionRange.end) {
                this.playerVars.end = null;
              } else {
                this.player.cueVideoById({
                  videoId: this.props.videoFact.youtubeId,
                  startSeconds: value,
                  endSeconds: selectionRange.end,
                  suggestedQuality: "default"
                });
                this.playerVars.end = selectionRange.end;
              }
            }
            this.setState({
              currentTime: value
            });
            if (this.player) {
              this.player.seekTo(value);
            } else {
              console.warn("Player not ready");
            }
          }
          break;
        default:
          const msg = "Video: Unknown range type.";
          alertErr(msg);
          throw msg;
      }
    }
    // // Clear the selection
    // this.setState({
    //   currentTime: range[1],
    //   startTime: range[0],
    //   endTime: range[2],
    //   captionIsHighlighted: false
    // });
  };
  handleReady = (event: any) => {
    this.player = event.target;
    this.cueVideo();
  };
  handleRestartPress = () => {
    if (this.state.captionIsHighlighted) {
      this.cueVideo();
      const selectionRange = this.getRangeSlider("SELECTION");
      if (selectionRange) {
        const clipStart = selectionRange.start;
        this.setState({
          currentTime: clipStart
        });
        if (this.player) {
          this.player.seekTo(clipStart);
        } else {
          console.warn("Player not ready");
        }
      } else {
        const msg = "Video: Can't find selection range. (2)";
        alertErr(msg);
        throw msg;
      }
    } else {
      this.setState({
        currentTime: 0
      });
      if (this.player) {
        this.player.seekTo(0);
      } else {
        console.warn("Player not ready");
      }
    }
  };
  handleSetClick = () => {
    const selectionRange = this.getRangeSlider("SELECTION");
    if (selectionRange && selectionRange.end) {
      const clipStart = selectionRange.start;
      const clipEnd = selectionRange.end;
      if (clipEnd > clipStart) {
        this.props.onSetClick([clipStart, clipEnd]);
      }
    } else {
      const msg = "Video: Can't find selection range. (3)";
      alertErr(msg);
      throw msg;
    }
  };
  handleSkipBackPress = (seconds: number) => {
    this.skipSeconds(-seconds);
  };
  handleSkipForwardPress = (seconds: number) => {
    this.skipSeconds(seconds);
  };
  handleZoomToClipPress = () => {
    if (this.state.captionIsHighlighted) {
      const selection = this.getRangeSlider("SELECTION");
      if (selection && selection.end) {
        const tenPercent = (selection.end - selection.start) * 0.1;
        const zoomRange: TimeRange = {
          start: selection.start - tenPercent,
          end: selection.end + tenPercent,
          type: "ZOOM",
          styles: TRACKSTYLES__RANGE,
          label: "Zoom"
        };
        this.setState({
          isZoomedToClip: true,
          rangeSliders: this.updateRangeSlider(zoomRange)
        });
      } else {
        const msg = "Video: Error getting clip. Cannot zoom to clip.";
        alertErr(msg);
        throw msg;
      }
    } else {
      const msg = "Video: Clip not set. Cannot zoom to clip.";
      alertErr(msg);
      throw msg;
    }
  };
  isZoomedToClip = (
    clip: [number, number],
    zoom: [number, number]
  ): boolean => {
    const tenPercent = (clip[1] - clip[0]) * 0.1;
    if (zoom[0] === clip[0] - tenPercent && zoom[1] === clip[1] + tenPercent) {
      return true;
    } else {
      return false;
    }
  };
  skipSeconds = (seconds: number) => {
    const newTime = this.state.currentTime + seconds;
    this.setState({
      currentTime: newTime
    });
    if (this.player) {
      this.player.seekTo(newTime);
    }
  };
  handleStateChange = (event: any) => {
    if (event.data === 0) {
      // Video ended
      this.stopTimer();
      this.player.cueVideoById({
        videoId: this.props.videoFact.youtubeId,
        startSeconds: this.state.currentTime,
        suggestedQuality: "default"
      });
      this.setState({
        isPaused: true
      });
    } else if (event.data === 1) {
      // Video playing
      this.startTimer();
      this.setState({
        currentTime: Math.round(event.target.getCurrentTime()),
        isPaused: false
      });
    } else if (event.data === 2) {
      // Video paused
      this.stopTimer();
      this.setState({
        currentTime: Math.round(event.target.getCurrentTime()),
        isPaused: true
      });
    } else if (event.data === 3) {
      // Video buffering
      this.stopTimer();
      this.setState({
        currentTime: Math.round(event.target.getCurrentTime()),
        isPaused: false
      });
    }
  };
  startTimer = () => {
    this.setState({
      currentTime: this.state.currentTime + 1
    });
    this.timerId = window.setTimeout(this.startTimer, 1000);
  };
  stopTimer = () => {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  };
  updateRangeSlider = (newRangeSlider: TimeRange): TimeRange[] => {
    let newRangeSliderArr: TimeRange[] = [];
    let rangeAlreadyExists = false;
    for (const rangeSlider of this.state.rangeSliders) {
      if (rangeSlider.type === newRangeSlider.type) {
        newRangeSliderArr = [...newRangeSliderArr, newRangeSlider];
        rangeAlreadyExists = true;
      } else {
        newRangeSliderArr = [...newRangeSliderArr, rangeSlider];
      }
    }
    if (!rangeAlreadyExists) {
      newRangeSliderArr = [...newRangeSliderArr, newRangeSlider];
    }
    return newRangeSliderArr;
  };
  componentWillUnmount() {
    this.stopTimer();
  }
  componentWillReceiveProps(nextProps: VideoProps) {
    if (
      nextProps.videoFact.youtubeId !== this.props.videoFact.youtubeId &&
      nextProps.clipRange
    ) {
      // Component has a new youtube video and a time range
      const charRange = this.getCharRange(
        nextProps.videoFact,
        nextProps.clipRange
      );
      this.setState({
        highlightedCharRange: charRange,
        captionIsHighlighted: true,
        isPaused: true
      });
    } else if (
      !nextProps.clipRange &&
      window.location.pathname.startsWith(Routes.FOUNDATION)
    ) {
      // No time range and on a /foundation route or sub-route
      this.setState({
        captionIsHighlighted: false,
        highlightedCharRange: [-1, -1],
        isPaused: true,
        rangeSliders: this.initializeRangeSliders(nextProps)
      });
      if (this.player) {
        this.player.pauseVideo();
      }
    } else if (
      nextProps.clipRange &&
      !isEqual(nextProps.clipRange, this.props.clipRange)
    ) {
      // There is a time range and it's different than the previous range
      const selection: TimeRange = {
        start: nextProps.clipRange[0],
        end: nextProps.clipRange[1],
        type: "SELECTION",
        styles: TRACKSTYLES__RANGE,
        label: "Clip"
      };

      let charRange: [number, number] = this.getCharRange(
        nextProps.videoFact,
        nextProps.clipRange
      );

      let newRangeSliders: TimeRange[] = [];
      let isZoomedToClip;
      if (this.getRangeSlider("ZOOM") === null) {
        const tenPercent =
          (nextProps.clipRange[1] - nextProps.clipRange[0]) * 0.1;
        const zoomRange: TimeRange = {
          start: nextProps.clipRange[0] - tenPercent,
          end: nextProps.clipRange[1] + tenPercent,
          type: "ZOOM",
          styles: TRACKSTYLES__RANGE,
          label: "Zoom"
        };
        newRangeSliders = this.updateRangeSlider(selection).concat([zoomRange]);
        isZoomedToClip = true;
      } else {
        newRangeSliders = this.updateRangeSlider(selection);
        isZoomedToClip = false;
      }

      this.setState({
        currentTime: nextProps.clipRange[0],
        captionIsHighlighted: true,
        highlightedCharRange: charRange,
        isZoomedToClip: isZoomedToClip,
        rangeSliders: newRangeSliders
      });
    }
  }
  render() {
    const selection = this.getRangeSlider("SELECTION");

    const opts = {
      height: "315",
      width: "560",
      playerVars: this.playerVars
    };

    const captionEventHandlers: CaptionViewEventHandlers = {
      onAfterRangeChange: this.handleAfterRangeChange,
      onHighlight: this.handleCaptionHighlight,
      onClearPress: this.handleClearClick,
      onPlayPausePress: this.handlePlayPausePress,
      onRangeChange: this.handleRangeChange,
      onRestartPress: this.handleRestartPress,
      onScroll: this.handleCaptionScroll,
      onSkipBackPress: this.handleSkipBackPress,
      onSkipForwardPress: this.handleSkipForwardPress,
      onZoomToClipPress: this.handleZoomToClipPress
    };

    return (
      <div className="video__outer-container">
        <div
          className={
            this.props.className
              ? this.props.className
              : "video__inner-container"
          }
        >
          <div className="video__container">
            <div className="video__header">
              {selection &&
              selection.end &&
              selection.end > selection.start &&
              !window.location.pathname.startsWith(Routes.DRAFTS) ? (
                <button
                  className="video__button video__button--top"
                  onClick={this.handleSetClick}
                >
                  Give your Take on this
                </button>
              ) : null}
              <p className="video__date">
                {this.props.videoFact.fact.primaryDate}
              </p>
            </div>
            <YouTube
              videoId={this.props.videoFact.youtubeId}
              opts={opts}
              onReady={this.handleReady}
              onPause={this.handlePause}
              onStateChange={this.handleStateChange}
              className="video__video"
            />
          </div>
          <CaptionView
            timer={this.state.currentTime}
            videoFact={this.props.videoFact}
            captionIsHighlighted={this.state.captionIsHighlighted}
            isPaused={this.state.isPaused}
            isZoomedToClip={this.state.isZoomedToClip}
            videoDuration={this.state.duration}
            eventHandlers={captionEventHandlers}
            highlightedCharRange={this.state.highlightedCharRange}
            rangeSliders={this.state.rangeSliders}
          />
        </div>
      </div>
    );
  }
}

export default Video;
