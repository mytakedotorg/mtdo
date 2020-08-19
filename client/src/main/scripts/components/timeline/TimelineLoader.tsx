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
import React, { useEffect, useState } from "react";
import { FoundationFetcher } from "../../common/foundation";
import {
  Corpus,
  decodeSocial,
  TimelineSocial,
} from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import TimelineLoadingView from "./TimelineLoadingView";
import { SetFactHandlers } from "./TimelinePreview";
import TimelineView from "./TimelineView";

interface TimelineLoaderProps {
  path: string;
  setFactHandlers?: SetFactHandlers;
}

interface TimelineLoaderState {
  facts?: FT.FactLink[];
}

const DEFAULT_TIMELINE_SOCIAL: TimelineSocial = {
  kind: "timeline",
  corpus: Corpus.Debates,
};

const TimelineLoader: React.FC<TimelineLoaderProps> = (props) => {
  const [state, setState] = useState<TimelineLoaderState>({});

  useEffect(() => {
    async function getAllFacts() {
      const allFacts: FT.FactLink[] = await FoundationFetcher.index();
      setState({
        facts: allFacts,
      });
    }
    getAllFacts();
  }, []);

  const parseURL = (path: string): TimelineSocial => {
    const embedSlash = path.lastIndexOf("/");
    if (embedSlash <= Routes.FOUNDATION.length) {
      return DEFAULT_TIMELINE_SOCIAL;
    }
    const embedRison = path.substring(embedSlash + 1);
    try {
      return decodeSocial(embedRison);
    } catch (err) {
      console.log(err);
      return DEFAULT_TIMELINE_SOCIAL;
    }
  };

  return state.facts ? (
    <TimelineView
      initialFact={parseURL(props.path)}
      factLinks={state.facts}
      setFactHandlers={props.setFactHandlers}
    />
  ) : (
    <TimelineLoadingView />
  );
};

export default TimelineLoader;
