import * as React from "react";
import config from "./config";
import YouTube from "react-youtube";

interface DebatesProps {
  onBackClick: () => void;
  onSetClick: (id: string, range: [number, number]) => void;
}

interface DebatesState {
  videos: DebateVideo[];
  activeVideoIdx: number;
  currentTime: number;
  startTime: number;
  endTime: number;
}

interface DebateVideo {
  id: string;
  img: string;
  title: string;
  date: string;
}

class Debates extends React.Component<DebatesProps, DebatesState> {
  constructor(props: DebatesProps) {
    super(props);

    this.state = {
      videos: this.getVideos(),
      activeVideoIdx: 0,
      currentTime: 0,
      startTime: 0,
      endTime: -1
    };
  }
  getVideos = (): DebateVideo[] => {
    let videos = config.videos.map(function(video) {
      return {
        id: video.id,
        img: "http://img.youtube.com/vi/" + video.id + "/0.jpg",
        title: video.title,
        date: video.date
      };
    });

    return videos;
  };
  handleClick = (index: number) => {
    if (this.state.activeVideoIdx !== index) {
      this.setState({
        activeVideoIdx: index
      });
    }
  };
  handlePause = (event: any) => {
    this.setState({
      currentTime: Math.round(event.target.getCurrentTime())
    });
  };
  handleSetClick = () => {
    if (
      this.state.activeVideoIdx >= 0 &&
      this.state.endTime > this.state.startTime
    ) {
      const videoId = this.state.videos[this.state.activeVideoIdx].id;
      this.props.onSetClick(videoId, [
        this.state.startTime,
        this.state.endTime
      ]);
    }
  };
  handleSetStart = () => {
    const startTime = this.state.currentTime;
    this.setState({
      startTime: startTime
    });
  };
  handleSetEnd = () => {
    const endTime = this.state.currentTime;
    this.setState({
      endTime: endTime
    });
  };
  render() {
    const opts = {
      height: "315",
      width: "560",
      playerVars: {
        rel: 0
      }
    };

    let activeVid = null;
    if (this.state.activeVideoIdx >= 0) {
      activeVid = (Object as any).assign(
        {},
        this.state.videos[this.state.activeVideoIdx]
      );
    }

    return (
      <div className="debates">
        <h2 className="debates__heading">Debates</h2>
        <p className="debates__instructions">
          Choose a video clip to support your Take.
        </p>
        <button onClick={this.props.onBackClick}>Back to Foundation</button>
        <button onClick={this.handleSetClick}>Send to Take</button>
        <div className="debates__row">
          <div className="debates__video-container">
            {activeVid
              ? <div>
                  <h3 className="debates__video-title">
                    {activeVid.title}
                  </h3>
                  <p className="debates__video-date">
                    {activeVid.date}
                  </p>
                  <YouTube
                    videoId={activeVid.id}
                    opts={opts}
                    onPause={this.handlePause}
                    className="debates__video"
                  />
                  <p>
                    Pause the video where you want your clip to start or stop.
                  </p>
                  <p>
                    Current Start Time: <span>{this.state.startTime}</span>
                  </p>
                  <button onClick={this.handleSetStart}>Set Start Time</button>
                  <p>
                    Current End Time: <span>{this.state.endTime}</span>
                  </p>
                  <button onClick={this.handleSetEnd}>Set End Time</button>
                </div>
              : null}
          </div>
          <div className="debates__list-container">
            <div className="debates__list">
              {this.state.videos.map(
                function(video: DebateVideo, index: number) {
                  return (
                    <div
                      key={index.toString()}
                      className="debates__card"
                      onClick={() => this.handleClick(index)}
                    >
                      <div className="debates__thumb-container">
                        <img
                          className="debates__thumb"
                          width="480"
                          height="360"
                          src={video.img}
                        />
                      </div>
                      <h3 className="debates__card-title">
                        {video.title}
                      </h3>
                      <p className="debates__card-date">
                        {video.date}
                      </p>
                    </div>
                  );
                }.bind(this)
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Debates;
