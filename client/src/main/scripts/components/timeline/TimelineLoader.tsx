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
import { decodeSocial } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import TimelineLoadingView from "./TimelineLoadingView";
import { SetFactHandlers } from "./TimelinePreview";
import { TimelineSocial } from "./TimelinePreviewLegacy";
import TimelineView from "./TimelineView";

interface TimelineLoaderProps {
  path: string;
  setFactHandlers?: SetFactHandlers;
}

interface TimelineLoaderState {
  facts?: FT.FactLink[];
}

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

  const parseURL = (path: string): TimelineSocial | string | null => {
    const embedSlash = path.indexOf("/", Routes.FOUNDATION.length + 1);
    if (embedSlash == -1 || path === Routes.FOUNDATION + "/") {
      return null;
    }
    const embedRison = path.substring(embedSlash + 1);
    if (embedRison === "") {
      // trailing slash
      return path.substring(Routes.FOUNDATION.length + 1, path.length - 1);
    } else {
      return decodeSocial(embedRison);
    }
  };

  return state.facts ? (
    <TimelineView
      initialFact={parseURL(props.path)}
      factLinks={state.facts}
      path={props.path}
      setFactHandlers={props.setFactHandlers}
    />
  ) : (
    <TimelineLoadingView />
  );
};

export default TimelineLoader;
