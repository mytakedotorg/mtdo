import * as React from "react";
import * as ReactDOM from "react-dom";

interface ClipEditorEventHandlers {
  onClearPress: () => void;
  onFineTuneUp: (rangeIdx: 0 | 1) => void;
  onFineTuneDown: (rangeIdx: 0 | 1) => void;
}

interface ClipEditorProps {
  startTime: string;
  endTime: string;
  eventHandlers: ClipEditorEventHandlers;
}

interface ClipEditorState {}

class ClipEditor extends React.Component<ClipEditorProps, ClipEditorState> {
  constructor(props: ClipEditorProps) {
    super(props);

    this.state = {};
  }
  render() {
    return (
      <div className="video__actions">
        <div className="video__action">
          <p className="video__instructions">Fine tune your clip</p>
          <button
            className="video__button video__button--bottom"
            onClick={this.props.eventHandlers.onClearPress}
          >
            Clear Selection
          </button>
        </div>
        <div className="video__action">
          <div className="video__tuning">
            <div className="video__action">
              <p className="video__instructions">Start Time</p>
              <div className="video__tuning-buttons">
                <button
                  className="video__button video__button--small"
                  onClick={() => this.props.eventHandlers.onFineTuneDown(0)}
                >
                  <i className="fa fa-arrow-down" aria-hidden="true" />
                </button>
                <span className="video__time">{this.props.startTime}</span>
                <button
                  className="video__button video__button--small"
                  onClick={() => this.props.eventHandlers.onFineTuneUp(0)}
                >
                  <i className="fa fa-arrow-up" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="video__action">
              <p className="video__instructions">End Time</p>
              <div className="video__tuning-buttons">
                <button
                  className="video__button video__button--small"
                  onClick={() => this.props.eventHandlers.onFineTuneDown(1)}
                >
                  <i className="fa fa-arrow-down" aria-hidden="true" />
                </button>
                <span className="video__time">{this.props.endTime}</span>
                <button
                  className="video__button video__button--small"
                  onClick={() => this.props.eventHandlers.onFineTuneUp(1)}
                >
                  <i className="fa fa-arrow-up" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ClipEditor;
