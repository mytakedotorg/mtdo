import * as React from "react";
import { SelectionOptions, SortedResults } from "./VideoResultsList";
import VideoResultPreview from "./VideoResultPreview";
import { PlayEvent } from "./VideoResult";
import { Foundation } from "../java2ts/Foundation";
import { fetchFact } from "../utils/databaseAPI";
import { alertErr } from "../utils/functions";

interface VideoFactsLoaderProps {
  onPlayClick: PlayEvent;
  results: SortedResults;
  searchTerm: string;
  sortBy: SelectionOptions;
}
interface VideoFactsLoaderState {
  loading: boolean;
  videoFact?: Foundation.VideoFactContent;
}
class VideoFactsLoader extends React.Component<
  VideoFactsLoaderProps,
  VideoFactsLoaderState
> {
  constructor(props: VideoFactsLoaderProps) {
    super(props);

    this.state = {
      loading: true
    };
  }
  getFact = (factHash: string) => {
    fetchFact(
      factHash,
      (
        error: string | Error | null,
        factContent: Foundation.VideoFactContent
      ) => {
        if (error) {
          if (typeof error != "string") {
            alertErr("VideoResultPreviewContainer: " + error.message);
          } else {
            alertErr("VideoResultPreviewContainer: " + error);
          }
          throw error;
        } else {
          this.setState({
            loading: false,
            videoFact: factContent
          });
        }
      }
    );
  };
  componentDidMount() {
    this.getFact(this.props.results.hash);
  }
  render() {
    return (
      <VideoFactsLoaderBranch
        containerProps={this.props}
        containerState={this.state}
      />
    );
  }
}

interface VideoFactsLoaderBranchProps {
  containerProps: VideoFactsLoaderProps;
  containerState: VideoFactsLoaderState;
}

const VideoFactsLoaderBranch: React.StatelessComponent<
  VideoFactsLoaderBranchProps
> = props => {
  if (props.containerState.loading || !props.containerState.videoFact) {
    return <VideoResultPreviewLoadingView />;
  } else {
    return (
      <VideoResultPreview
        searchTerm={props.containerProps.searchTerm}
        sortBy={props.containerProps.sortBy}
        turns={props.containerProps.results.turns}
        videoFact={props.containerState.videoFact}
        onPlayClick={props.containerProps.onPlayClick}
      />
    );
  }
};

export const VideoResultPreviewLoadingView: React.StatelessComponent<{}> = props => (
  <div className="result-preview">
    <p className="result-preview__text">Loading search results...</p>
  </div>
);

export default VideoFactsLoader;
