import * as React from "react";
import * as ReactDOM from "react-dom";
import { Range } from "rc-slider";
import { RangeType, TimeRange } from "./Video";
import { convertSecondsToTimestamp } from "../utils/functions";

export interface TrackSliderEventHandlers {
  onAfterRangeChange: (range: [number, number], type: RangeType) => any;
  onRangeChange: (range: [number, number], type: RangeType) => any;
}

interface TrackSliderProps {
  start: number;
  end: number;
  eventHandlers: TrackSliderEventHandlers;
  rangeSliders: TimeRange[];
  step: number;
}

interface TrackSliderState {
  prettyStart: string;
  prettyEnd: string;
}

class TrackSlider extends React.Component<TrackSliderProps, TrackSliderState> {
  private timerId: number | null;
  constructor(props: TrackSliderProps) {
    super(props);

    this.state = {
      prettyStart: convertSecondsToTimestamp(props.start),
      prettyEnd: convertSecondsToTimestamp(props.end)
    };
  }
  clearTimer = () => {
    if (this.timerId) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
  };
  handleRangeChange = (value: [number, number], type: RangeType) => {
    // Throttle the event a bit
    if (!this.timerId) {
      this.props.eventHandlers.onRangeChange(value, type);
      this.timerId = window.setTimeout(this.clearTimer, 10);
    }
  };
  handleAfterRangeChange = (value: [number, number], type: RangeType) => {
    this.props.eventHandlers.onAfterRangeChange(value, type);
  };
  componentWillReceiveProps(nextProps: TrackSliderProps) {
    if (
      this.props.start !== nextProps.start ||
      this.props.end !== nextProps.end
    ) {
      this.setState({
        prettyStart: convertSecondsToTimestamp(nextProps.start),
        prettyEnd: convertSecondsToTimestamp(nextProps.end)
      });
    }
  }
  render() {
    const { props } = this;

    return (
      <div className="trackSlider">
        <p className="trackSlider__text trackSlider__text--min">
          {this.state.prettyStart}
        </p>
        <div className="trackSlider__range-container">
          {props.rangeSliders.map(rangeSlider => {
            const start =
              rangeSlider.start < props.start ? props.start : rangeSlider.start;
            const end =
              rangeSlider.end > props.end ? props.end : rangeSlider.end;
            return (
              <div className="trackSlider__range">
                <Range
                  defaultValue={[0, props.end]}
                  min={props.start}
                  max={props.end}
                  onChange={(value: [number, number]) =>
                    this.handleRangeChange(value, rangeSlider.type)
                  }
                  onAfterChange={(value: [number, number]) =>
                    this.handleAfterRangeChange(value, rangeSlider.type)
                  }
                  step={props.step}
                  value={[start, end]}
                  railStyle={rangeSlider.styles.rail}
                  trackStyle={[rangeSlider.styles.track]}
                  handleStyle={[
                    rangeSlider.styles.handle,
                    rangeSlider.styles.handle
                  ]}
                />
              </div>
            );
          })}
        </div>
        <p className="trackSlider__text trackSlider__text--max">
          {this.state.prettyEnd}
        </p>
      </div>
    );
  }
}

export default TrackSlider;
