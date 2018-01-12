import * as React from "react";
import * as ReactDOM from "react-dom";
import TimelineView from "./TimelineView";
import { Routes } from "../java2ts/Routes";

interface FoundationViewProps {
  path: string;
}

class FoundationView extends React.Component<FoundationViewProps, {}> {
  constructor(props: FoundationViewProps) {
    super(props);
  }
  render() {
    return (
      <div className="foundation">
        {!this.props.path.startsWith(Routes.FOUNDATION) ? (
          <TimelineView path={this.props.path} />
        ) : (
          <div>
            <div className="foundation__inner-container">
              <h1 className="foundation__heading">Foundation of Facts</h1>
              <p className="timeline__instructions">
                Explore Facts in the timeline below.
              </p>
            </div>
            <TimelineView path={this.props.path} />
          </div>
        )}
      </div>
    );
  }
}

export default FoundationView;
