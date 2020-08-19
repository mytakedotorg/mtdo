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
import React, { useEffect, useState } from "react";
import { FoundationNode } from "../../common/CaptionNodes";
import {
  FoundationFetcher,
  isDocument,
  isVideo,
} from "../../common/foundation";
import { FT } from "../../java2ts/FT";
import TimelinePreview, { SetFactHandlers } from "./TimelinePreview";
import TimelinePreviewLoadingView from "./TimelinePreviewLoadingView";

interface TimelinePreviewContainerProps {
  selectedFact: FT.FactLink;
  setFactHandlers?: SetFactHandlers;
}

interface TimelinePreviewContainerState {
  loading: boolean;
  videoFact?: FT.VideoFactContent;
  nodes?: FoundationNode[];
}

const TimelinePreviewContainer: React.FC<TimelinePreviewContainerProps> = ({
  selectedFact,
  setFactHandlers,
}) => {
  const [state, setState] = useState<TimelinePreviewContainerState>({
    loading: true,
  });

  useEffect(() => {
    const getFact = async (factHash: string) => {
      const factContent = await FoundationFetcher.justOneFact(factHash);

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
        throw "Unknown kind of Fact";
      }
    };

    setState((prevState) => ({
      ...prevState,
      loading: true,
    }));
    if (selectedFact) {
      getFact(selectedFact.hash);
    }
  }, [selectedFact?.fact]);

  return state.loading ? (
    <TimelinePreviewLoadingView />
  ) : (
    <TimelinePreview
      factLink={selectedFact}
      setFactHandlers={setFactHandlers}
      nodes={state.nodes!}
      videoFact={state.videoFact!}
      // todo ranges
      // todo offset
    />
  );
};

export default TimelinePreviewContainer;
