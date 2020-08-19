/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
import React from "react";
import { isDocument, isVideo } from "../../common/foundation";
import { PreviewSocial } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import TimelinePreview, { SetFactHandlers } from "./TimelinePreview";

interface TimelinePreviewLegacyProps {
  social: PreviewSocial;
  setFactHandlers?: SetFactHandlers;
  factContent: FT.VideoFactContent | FT.DocumentFactContent;
}

const TimelinePreviewLegacy: React.FC<TimelinePreviewLegacyProps> = ({
  social,
  setFactHandlers,
  factContent,
}) => {
  const cut = getCut(social);
  const ranges = cut
    ? {
        highlightedRange: cut,
        viewRange: cut,
      }
    : undefined;
  return (
    <TimelinePreview
      factLink={{
        fact: factContent.fact,
        hash: social.fact,
      }}
      videoFact={isVideo(factContent) ? factContent : undefined}
      nodes={
        isDocument(factContent)
          ? factContent.components.map((dc) => ({
              component: dc.component,
              innerHTML: [dc.innerHTML],
              offset: dc.offset,
            }))
          : undefined
      }
      setFactHandlers={setFactHandlers}
      ranges={ranges}
    />
  );
};

function getCut(social: PreviewSocial): [number, number] | null {
  switch (social.kind) {
    case "factUncut":
      return null;
    case "textCut":
    case "videoCut":
      return social.cut;
  }
}

export default TimelinePreviewLegacy;
