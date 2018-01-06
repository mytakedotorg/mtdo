import * as React from "react";
import * as ReactDOM from "react-dom";
import TimelineView from "./TimelineView";

interface FoundationViewProps {
  path: string;
  hashUrl?: string;
}

class FoundationView extends React.Component<FoundationViewProps, {}> {
  constructor(props: FoundationViewProps) {
    super(props);
  }
  render() {
    return (
      <div className="foundation">
        {this.props.hashUrl || this.props.path.length > 11 ? (
          <TimelineView path={this.props.path} hashUrl={this.props.hashUrl} />
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
