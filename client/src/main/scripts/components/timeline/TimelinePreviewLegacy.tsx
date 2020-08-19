import React from "react";
import { FoundationNode } from "../../common/CaptionNodes";
import { PreviewSocial } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import TimelinePreview, { SetFactHandlers } from "./TimelinePreview";

interface TimelinePreviewLegacyProps {
  nodes: FoundationNode[];
  selectedFact: PreviewSocial;
  setFactHandlers?: SetFactHandlers;
  videoFact: FT.VideoFactContent;
}

const TimelinePreviewLegacy: React.FC<TimelinePreviewLegacyProps> = (props) => {
  return (
    <TimelinePreview
      factLink={{
        fact: props.videoFact.fact,
        hash: props.selectedFact.fact,
      }}
      videoFact={props.videoFact}
      nodes={props.nodes}
      setFactHandlers={props.setFactHandlers}
      ranges={{
        highlightedRange: props.selectedFact.cut,
        viewRange: props.selectedFact.cut,
      }}
      offset={0}
    />
  );
};

export default TimelinePreviewLegacy;
