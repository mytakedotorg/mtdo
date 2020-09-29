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
import { decodeSocial, PreviewSocial } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import TimelineLoadingView from "./TimelineLoadingView";
import { SetFactHandlers } from "./TimelinePreview";
import TimelineView from "./TimelineView";
import { get } from "../../network";

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
      const index: FT.FactsetIndex = await get(
        // `git hash-object BLAH` for https://github.com/mytakedotorg/us-presidential-debates/blob/staging/sausage/index.json
        "https://mytake.org/api/fact/E74aoUY=0f4ae6f0a789891c41ec3372cde46a89ee3b57cb"
      );
      setState({
        facts: index.facts,
      });
    }
    getAllFacts();
  }, []);

  const parseURL = (path: string): PreviewSocial | null => {
    const embedSlash = path.lastIndexOf("/");
    if (embedSlash <= Routes.FOUNDATION.length) {
      return null;
    }
    const embedRison = path.substring(embedSlash + 1);
    try {
      return decodeSocial(embedRison);
    } catch (err) {
      console.log(err);
      return null;
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
