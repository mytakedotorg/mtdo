import * as React from "react";
import VideoResultTurnList from "./VideoResultTurnList";
import { SelectionOptions } from "./VideoResultsList";
import { PlayEvent } from "./VideoResult";
import { Foundation } from "../java2ts/Foundation";

interface VideoResultPreviewProps {
  searchTerm: string;
  sortBy: SelectionOptions;
  turns: number[];
  videoFact: Foundation.VideoFactContent;
  onPlayClick: PlayEvent;
}
interface VideoResultPreviewState {}

class VideoResultPreview extends React.Component<
  VideoResultPreviewProps,
  VideoResultPreviewState
> {
  constructor(props: VideoResultPreviewProps) {
    super(props);
  }
  render() {
    const { searchTerm, sortBy, turns, videoFact } = this.props;
    return (
      <div className="results__preview">
        <h2 className="results__subheading">
          Presidential debate | {videoFact.fact.title} -{" "}
          {videoFact.fact.primaryDate}
        </h2>
        {turns.map((turn, idx) => {
          return (
            <VideoResultTurnList
              key={idx.toString()}
              onPlayClick={this.props.onPlayClick}
              searchTerm={searchTerm}
              sortBy={sortBy}
              turn={turn}
              videoFact={videoFact}
            />
          );
        })}
      </div>
    );
  }
}

export default VideoResultPreview;
