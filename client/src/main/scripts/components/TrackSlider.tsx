/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
import * as React from "react";
import RangeContainer from "./RangeContainer";
import { RangeType, StateAuthority, TimeRange } from "./Video";
import { convertSecondsToTimestamp } from "../utils/functions";

export interface TrackSliderEventHandlers {
  onAfterRangeChange: (
    value: [number, number] | number,
    type: RangeType
  ) => any;
  onRangeChange: (value: [number, number] | number, type: RangeType) => any;
}

interface TrackSliderProps {
  end: number;
  eventHandlers: TrackSliderEventHandlers;
  rangeSliders: TimeRange[];
  start: number;
  stateAuthority: StateAuthority;
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
            let defaultValue: number | [number, number];
            let value: number | [number, number];
            if (typeof rangeSlider.end !== "undefined") {
              const end =
                rangeSlider.end > props.end ? props.end : rangeSlider.end;
              defaultValue = [0, props.end];
              value = [start, end];
            } else {
              defaultValue = 0;
              value = start;
            }
            return (
              <RangeContainer
                defaultValue={defaultValue}
                handleStyle={rangeSlider.styles.handle}
                label={rangeSlider.label}
                min={props.start}
                max={props.end}
                eventHandlers={props.eventHandlers}
                railStyle={rangeSlider.styles.rail}
                stateAuthority={props.stateAuthority}
                step={props.step}
                trackStyle={rangeSlider.styles.track}
                type={rangeSlider.type}
                value={value}
                key={rangeSlider.type}
              />
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
