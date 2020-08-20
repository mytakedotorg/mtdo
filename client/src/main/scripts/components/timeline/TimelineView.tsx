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
import { slugify } from "../..//common/functions";
import {
  Corpus,
  encodeSocial,
  PreviewSocial,
} from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import Timeline, { TimelineItemData } from "./Timeline";
import { SetFactHandlers } from "./TimelinePreview";
import TimelinePreviewContainer from "./TimelinePreviewContainer";
import TimelineRadioButtons from "./TimelineRadioButtons";

interface TimelineViewProps {
  initialFact: PreviewSocial | null;
  factLinks: FT.FactLink[];
  setFactHandlers?: SetFactHandlers;
}

function getUrlFromSocial(
  social: PreviewSocial,
  factLinks: FT.FactLink[]
): string {
  const title = factLinks.find((fl) => fl.hash === social.fact)?.fact.title;
  if (title) {
    const slugTitle = slugify(title);
    return `${Routes.FOUNDATION}/${slugTitle}/${encodeSocial(social)}`;
  }
  return `${Routes.FOUNDATION}/${encodeSocial(social)}`;
}

function getSelectedOptionFromInitialFact(
  initialFact: PreviewSocial | null,
  factLinks: FT.FactLink[]
): Corpus {
  switch (initialFact?.kind) {
    case "factUncut":
      switch (factLinks.find((fl) => fl.hash === initialFact.fact)?.fact.kind) {
        case "video":
          return Corpus.Debates;
        case "document":
          return Corpus.Debates;
        default:
          // todo gitfact
          return Corpus.Debates;
      }
    case "textCut":
      return Corpus.Documents;
    case "videoCut":
      return Corpus.Debates;
  }
  return Corpus.Debates;
}

const TimelineView: React.FC<TimelineViewProps> = ({
  initialFact,
  factLinks,
  setFactHandlers,
}) => {
  const [selectedOption, setSelectedOption] = useState<Corpus>(
    getSelectedOptionFromInitialFact(initialFact, factLinks)
  );
  const [social, setSocial] = useState<PreviewSocial | null>(initialFact);
  const timelineItems = getTimelineItems(selectedOption, factLinks);

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value as Corpus;
    if (value !== selectedOption) {
      setSelectedOption(value);
    }
  };

  const handleItemClick = (factHash?: string) => {
    if (factHash) {
      setSocial({
        kind: "factUncut",
        fact: factHash,
      });
    }
  };

  const handlePopState = () => {};

  useEffect(() => {
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    window.history.pushState(
      {},
      "UnusedTitle",
      getUrlFromSocial(social!, factLinks)
    );
  }, [social]);

  return (
    <div className={"timeline__view"}>
      <TimelineRadioButtons
        selectedOption={selectedOption}
        onChange={handleChange}
      />
      <Timeline
        onItemClick={handleItemClick}
        selectedOption={selectedOption}
        timelineItems={timelineItems}
      />
      {social && (
        <TimelinePreviewContainer
          social={social}
          setFactHandlers={setFactHandlers}
        />
      )}
    </div>
  );
};

function getTimelineItems(
  corpus: Corpus,
  factLinks: FT.FactLink[]
): TimelineItemData[] {
  const targetKindMap: Record<Corpus, string> = {
    [Corpus.Debates]: "video",
    [Corpus.Documents]: "document",
  };
  const targetKind = targetKindMap[corpus];

  return factLinks
    .filter((fl) => fl.fact.kind === targetKind)
    .map((fl) => ({
      id: fl.hash,
      idx: fl.hash,
      start: new Date(fl.fact.primaryDate),
      content: fl.fact.title,
      kind: fl.fact.kind,
    }));
}
export default TimelineView;
