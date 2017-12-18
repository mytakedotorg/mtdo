import * as React from "react";

const TimelineLoadingView: React.StatelessComponent<{}> = props => (
  <div className="timeline__preview">
    <div className="document document--static">
      <p className="document__text">Loading Timeline</p>
    </div>
  </div>
);

export default TimelineLoadingView;
