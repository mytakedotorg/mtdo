import * as React from "react";
import * as ReactDOM from "react-dom";
import Slider, { Range } from "rc-slider";
import { RangeType, TimeRange } from "./Video";
import { convertSecondsToTimestamp } from "../utils/functions";

export interface TrackSliderEventHandlers {
  onAfterRangeChange: (
    value: [number, number] | number,
    type: RangeType
  ) => any;
  onRangeChange: (value: [number, number] | number, type: RangeType) => any;
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
  constructor(props: TrackSliderProps) {
    super(props);

    this.state = {
      prettyStart: convertSecondsToTimestamp(props.start),
      prettyEnd: convertSecondsToTimestamp(props.end)
    };
  }
  handleRangeChange = (value: [number, number] | number, type: RangeType) => {
    this.props.eventHandlers.onRangeChange(value, type);
  };
  handleAfterRangeChange = (
    value: [number, number] | number,
    type: RangeType
  ) => {
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
            if (typeof rangeSlider.end !== "undefined") {
              const end =
                rangeSlider.end > props.end ? props.end : rangeSlider.end;
              return (
                <div className="trackSlider__range" key={rangeSlider.type}>
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
                  <span className="trackSlider__label">
                    {rangeSlider.label}
                  </span>
                </div>
              );
            } else {
              return (
                <div className="trackSlider__range" key={rangeSlider.type}>
                  <Slider
                    defaultValue={0}
                    min={props.start}
                    max={props.end}
                    onChange={(value: number) =>
                      this.handleRangeChange(value, rangeSlider.type)
                    }
                    onAfterChange={(value: number) =>
                      this.handleAfterRangeChange(value, rangeSlider.type)
                    }
                    step={props.step}
                    value={start}
                    railStyle={rangeSlider.styles.rail}
                    trackStyle={rangeSlider.styles.track}
                    handleStyle={rangeSlider.styles.handle}
                  />
                  <span className="trackSlider__label">
                    {rangeSlider.label}
                  </span>
                </div>
              );
            }
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
