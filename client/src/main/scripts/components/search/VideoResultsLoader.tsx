/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
import React, { useState, useEffect } from "react";
import VideoResultsList from "./VideoResultsList";
import { search, SearchResult } from "./database/SearchDatabaseApi";

interface VideoResultsLoaderProps {
  searchQuery: string;
}

interface VideoResultsLoaderState {
  searchResult?: SearchResult;
}

const VideoResultsLoader: React.FC<VideoResultsLoaderProps> = (props) => {
  const [state, setState] = useState<VideoResultsLoaderState>({});

  useEffect(() => {
    async function connectSearchDatabase() {
      const searchResult = await search(props.searchQuery);
      setState({
        searchResult,
      });
    }

    connectSearchDatabase();
  }, []);

  return state.searchResult ? (
    <VideoResultsList searchResult={state.searchResult} />
  ) : (
    <VideoResultLoadingView />
  );
};

const VideoResultLoadingView: React.FC = () => (
  <div className="results">
    <div className="results__inner-container">
      <h1 className="results__heading">Searching...</h1>
    </div>
  </div>
);

export default VideoResultsLoader;
