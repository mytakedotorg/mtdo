/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
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
