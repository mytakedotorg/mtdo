import * as React from "react";
import VideoResultsList from "./VideoResultsList";
import { Routes } from "../java2ts/Routes";
import { Search } from "../java2ts/Search";
import { postRequest } from "../utils/databaseAPI";

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

export const VideoResultLoadingView: React.StatelessComponent<{}> = props => (
  <div className="results">
    <div className="results__inner-container">
      <h1 className="results__heading">Searching...</h1>
    </div>
  </div>
);

export default VideoResultsLoader;
