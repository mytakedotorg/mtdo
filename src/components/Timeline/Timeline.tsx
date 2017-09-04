import * as React from "react";

interface TimelineProps {}

interface TimelineState {}

export default class Timeline extends React.Component<
  TimelineProps,
  TimelineState
> {
  constructor(props: TimelineProps) {
    super(props);
  }
  render() {
    return <p>This is a Timeline</p>;
  }
}
