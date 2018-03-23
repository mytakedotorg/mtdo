import * as React from "react";
import { SortedResults, VideoResultPreview } from "./VideoResults";
import { Foundation } from "../java2ts/Foundation";
import { fetchFact } from "../utils/databaseAPI";
import { alertErr } from "../utils/functions";

interface VideoResultsLoaderProps {
  results: SortedResults;
}
interface VideoResultsLoaderState {
  loading: boolean;
  videoFact?: Foundation.VideoFactContent;
}
class VideoResultsLoader extends React.Component<
  VideoResultsLoaderProps,
  VideoResultsLoaderState
> {
  constructor(props: VideoResultsLoaderProps) {
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
    return <div className="result-preview" />;
  }
}

interface VideoResultsLoaderBranchProps {
  containerProps: VideoResultsLoaderProps;
  containerState: VideoResultsLoaderState;
}

const VideoResultsLoaderBranch: React.StatelessComponent<
  VideoResultsLoaderBranchProps
> = props => {
  if (props.containerState.loading || !props.containerState.videoFact) {
    return <VideoResultPreviewLoadingView />;
  } else {
    return (
      <VideoResultPreview
        turns={props.containerProps.results.turns}
        videoFact={props.containerState.videoFact}
      />
    );
  }
};

const VideoResultPreviewLoadingView: React.StatelessComponent<{}> = props => (
  <div className="result-preview">
    <p className="result-preview__text">Loading search results...</p>
  </div>
);

export default VideoResultsLoader;
