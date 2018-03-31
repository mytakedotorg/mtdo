import * as React from "react";
import VideoResultsList, {
  PlayEvent,
  SelectionOptions,
  SortedResults,
  VideoResultPreview
} from "./VideoResults";
import { Routes } from "../java2ts/Routes";
import { Foundation } from "../java2ts/Foundation";
import { Search } from "../java2ts/Search";
import { fetchFact, postRequest } from "../utils/databaseAPI";
import { alertErr } from "../utils/functions";

interface VideoResultsLoaderProps {
  searchTerm: string;
}

interface VideoResultsLoaderState {
  loading: boolean;
  resultList?: Search.FactResultList;
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
  getFactResults = () => {
    const bodyJson: Search.Request = {
      q: this.props.searchTerm
    };
    postRequest(
      Routes.API_SEARCH,
      bodyJson,
      function(json: Search.FactResultList) {
        const resultList: Search.FactResultList = json;
        this.setState({
          loading: false,
          resultList: resultList
        });
      }.bind(this)
    );
  };
  componentDidMount() {
    this.getFactResults();
  }
  render() {
    return (
      <VideoResultsLoaderBranch
        containerProps={this.props}
        containerState={this.state}
      />
    );
  }
}

interface VideoResultsLoaderBranchProps {
  containerProps: VideoResultsLoaderProps;
  containerState: VideoResultsLoaderState;
}

const VideoResultsLoaderBranch: React.StatelessComponent<
  VideoResultsLoaderBranchProps
> = props => {
  if (props.containerState.loading || !props.containerState.resultList) {
    return <VideoResultLoadingView />;
  } else {
    return (
      <VideoResultsList
        results={props.containerState.resultList}
        searchTerm={props.containerProps.searchTerm}
      />
    );
  }
};

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
export class VideoFactsLoader extends React.Component<
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

const VideoResultPreviewLoadingView: React.StatelessComponent<{}> = props => (
  <div className="result-preview">
    <p className="result-preview__text">Loading search results...</p>
  </div>
);

const VideoResultLoadingView: React.StatelessComponent<{}> = props => (
  <div className="results">
    <div className="results__inner-container">
      <h1 className="results__heading">Searching...</h1>
    </div>
  </div>
);

export default VideoResultsLoader;
