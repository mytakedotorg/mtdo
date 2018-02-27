import * as React from "react";
import * as ReactDOM from "react-dom";
import Slider, { Range } from "rc-slider";
import { TrackSliderEventHandlers } from "./TrackSlider";
import { RangeType, StateAuthority, StylesObject, TimeRange } from "./Video";

interface RangeContainerProps {
  defaultValue: number | [number, number];
  eventHandlers: TrackSliderEventHandlers;
  handleStyle: StylesObject;
  label: string;
  min: number;
  max: number;
  railStyle: StylesObject;
  stateAuthority: StateAuthority;
  step: number;
  trackStyle: StylesObject;
  type: RangeType;
  value: number | [number, number];
}

interface RangeContainerState {}

class RangeContainer extends React.Component<
  RangeContainerProps,
  RangeContainerState
> {
  constructor(props: RangeContainerProps) {
    super(props);
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
  render() {
    const { props } = this;
    if (props.type === "CURRENT_TIME") {
      return (
        <div className="trackSlider__range">
          <Slider
            defaultValue={props.defaultValue}
            min={props.min}
            max={props.max}
            onChange={(value: number) =>
              this.handleRangeChange(value, props.type)
            }
            onAfterChange={(value: number) =>
              this.handleAfterRangeChange(value, props.type)
            }
            step={props.step}
            value={props.value}
            railStyle={props.railStyle}
            trackStyle={props.trackStyle}
            handleStyle={props.handleStyle}
          />
          <span className="trackSlider__label">{props.label}</span>
        </div>
      );
    } else {
      return (
        <div className="trackSlider__range">
          <Range
            defaultValue={props.defaultValue}
            min={props.min}
            max={props.max}
            onChange={(value: [number, number]) =>
              this.handleRangeChange(value, props.type)
            }
            onAfterChange={(value: [number, number]) =>
              this.handleAfterRangeChange(value, props.type)
            }
            step={props.step}
            value={props.value}
            railStyle={props.railStyle}
            trackStyle={[props.trackStyle]}
            handleStyle={[props.handleStyle, props.handleStyle]}
          />
          <span className="trackSlider__label">{props.label}</span>
        </div>
      );
    }
  }
}

export default RangeContainer;
