/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import { FoundationNode } from "../common/CaptionNodes";
import { alertErr } from "../utils/functions";
import TimelinePreview, { Ranges, SetFactHandlers } from "./TimelinePreview";
import TimelinePreviewLoadingView from "./TimelinePreviewLoadingView";
import { Foundation } from "../java2ts/Foundation";
import { isVideo, isDocument } from "../utils/foundationData/FoundationData";
import { FoundationDataBuilder } from "../utils/foundationData/FoundationDataBuilder";

export interface TimelinePreviewContainerProps {
  factLink: Foundation.FactLink;
  setFactHandlers?: SetFactHandlers;
  ranges?: Ranges;
  offset?: number;
}

export interface TimelinePreviewContainerState {
  loading: boolean;
  videoFact?: Foundation.VideoFactContent;
  nodes?: FoundationNode[];
}

const TimelinePreviewContainer: React.FC<TimelinePreviewContainerProps> = (
  props
) => {
  const [state, setState] = useState<TimelinePreviewContainerState>({
    loading: true,
  });

  useEffect(() => {
    const getFact = async (factHash: string) => {
      const builder = new FoundationDataBuilder();
      builder.add(factHash);
      const foundationData = await builder.build();
      const factContent = foundationData.getFactContent(factHash);

      let nodes: FoundationNode[] = [];
      if (isDocument(factContent)) {
        for (let documentComponent of factContent.components) {
          nodes.push({
            component: documentComponent.component,
            innerHTML: [documentComponent.innerHTML],
            offset: documentComponent.offset,
          });
        }
        setState({
          loading: false,
          nodes: nodes,
        });
      } else if (isVideo(factContent)) {
        setState({
          loading: false,
          videoFact: factContent,
        });
      } else {
        alertErr("TimelinePreviewContainer: Unknown kind of Fact");
        throw "Unknown kind of Fact";
      }
    };

    setState((prevState) => ({
      ...prevState,
      loading: true,
    }));

    getFact(props.factLink.hash);
  }, [props.factLink.hash]);

  return state.loading ? (
    <TimelinePreviewLoadingView />
  ) : (
    <TimelinePreview
      factLink={props.factLink}
      videoFact={state.videoFact}
      nodes={state.nodes}
      setFactHandlers={props.setFactHandlers}
      ranges={props.ranges}
      offset={props.offset}
    />
  );
};

export default TimelinePreviewContainer;
