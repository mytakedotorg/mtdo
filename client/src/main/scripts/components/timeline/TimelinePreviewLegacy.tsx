import React from "react";
import { FoundationNode } from "../../common/CaptionNodes";
import { isDocument, isVideo } from "../../common/foundation";
import { PreviewSocial } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import TimelinePreview, { SetFactHandlers } from "./TimelinePreview";

interface TimelinePreviewLegacyProps {
  social: PreviewSocial;
  setFactHandlers?: SetFactHandlers;
  factContent: FT.VideoFactContent | FT.DocumentFactContent;
}

function isFoundationNodeList(
  fact: FoundationNode[] | FT.VideoFactContent
): fact is FoundationNode[] {
  return Array.isArray(fact);
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
