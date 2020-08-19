import React from "react";
import { FoundationNode } from "../../common/CaptionNodes";
import { PreviewSocial } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import TimelinePreview, { SetFactHandlers } from "./TimelinePreview";

interface TimelinePreviewLegacyProps {
  nodes: FoundationNode[];
  social: PreviewSocial;
  setFactHandlers?: SetFactHandlers;
  videoFact: FT.VideoFactContent;
}

const TimelinePreviewLegacy: React.FC<TimelinePreviewLegacyProps> = ({
  nodes,
  social,
  setFactHandlers,
  videoFact,
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
        fact: videoFact.fact,
        hash: social.fact,
      }}
      videoFact={videoFact}
      nodes={nodes}
      setFactHandlers={setFactHandlers}
      ranges={ranges}
      offset={0}
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
