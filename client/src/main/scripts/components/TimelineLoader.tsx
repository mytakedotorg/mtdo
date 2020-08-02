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
import TimelineView from "./TimelineView";
import { SetFactHandlers } from "./TimelinePreview";
import TimelineLoadingView from "./TimelineLoadingView";
import { FT } from "../java2ts/FT";
import { FoundationDataBuilder } from "../utils/foundationData/FoundationDataBuilder";

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
      const allFacts: FT.FactLink[] = await FoundationDataBuilder.index();
      setState({
        facts: allFacts,
      });
    }
    getAllFacts();
  }, []);

  return state.facts ? (
    <TimelineView
      factLinks={state.facts}
      path={props.path}
      setFactHandlers={props.setFactHandlers}
    />
  ) : (
    <TimelineLoadingView />
  );
};

export default TimelineLoader;
