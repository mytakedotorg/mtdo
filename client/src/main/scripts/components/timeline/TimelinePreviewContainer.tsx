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
import { Foundation } from "../../common/foundation";
import { PreviewSocial } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import { SetFactHandlers } from "./TimelinePreview";
import TimelinePreviewLegacy from "./TimelinePreviewLegacy";
import TimelinePreviewLoadingView from "./TimelinePreviewLoadingView";

interface TimelinePreviewContainerProps {
  social: PreviewSocial;
  setFactHandlers?: SetFactHandlers;
}

interface TimelinePreviewContainerState {
  loading: boolean;
  factContent?: FT.VideoFactContent | FT.DocumentFactContent;
}

const TimelinePreviewContainer: React.FC<TimelinePreviewContainerProps> = ({
  social,
  setFactHandlers,
}) => {
  const [state, setState] = useState<TimelinePreviewContainerState>({
    loading: true,
  });

  useEffect(() => {
    const getFact = async (factHash: string) => {
      const factContent = await Foundation.justOneFact(factHash);
      setState({
        loading: false,
        factContent,
      });
    };

    setState((prevState) => ({
      ...prevState,
      loading: true,
    }));
    getFact(social.fact);
  }, [social.fact]);

  return state.loading ? (
    <TimelinePreviewLoadingView />
  ) : (
    <TimelinePreviewLegacy
      social={social}
      setFactHandlers={setFactHandlers}
      factContent={state.factContent!}
    />
  );
};

export default TimelinePreviewContainer;
