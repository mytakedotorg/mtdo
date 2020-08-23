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
import * as React from "react";
import { FoundationFetcher } from "../../common/foundation";
import { getCut } from "../../common/video";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import { FactUncut, Social, TextCut, VideoCut } from "../social/social";
import { HeaderTags } from "./SocialHeaderTemplate";

export async function socialHeader(
  social: Social,
  socialRison: string
): Promise<React.ReactElement> {
  switch (social.kind) {
    case "textCut":
      return headerTextCut(
        social,
        socialRison,
        await FoundationFetcher.justOneDocument(social.fact)
      );
    case "videoCut":
      return headerVideoCut(
        social,
        socialRison,
        await FoundationFetcher.justOneVideo(social.fact)
      );
    case "factUncut":
      return headerFactUncut(
        social,
        socialRison,
        await FoundationFetcher.justOneFact(social.fact)
      );
  }
}

function headerFactUncut(
  social: FactUncut,
  socialRison: string,
  fact: FT.DocumentFactContent | FT.VideoFactContent
): React.ReactElement {
  return (
    <HeaderTags
      url={`https://mytake.org/foundation/${socialRison}`}
      rison={socialRison}
      title={fact.fact.title}
      desc={"TODO"}
      imageAlt={""}
    />
  );
}

function headerTextCut(
  social: TextCut,
  socialRison: string,
  fact: FT.DocumentFactContent
): React.ReactElement {
  return (
    <HeaderTags
      url={`https://mytake.org/foundation/${socialRison}`}
      rison={socialRison}
      title={fact.fact.title}
      desc={"TODO"}
      imageAlt={""}
    />
  );
}

function headerVideoCut(
  social: VideoCut,
  socialRison: string,
  fact: FT.VideoFactContent
): React.ReactElement {
  const [speaker, said] = getCut(fact, social.cut);
  return (
    <HeaderTags
      url={`https://mytake.org/foundation/${socialRison}`}
      rison={socialRison}
      title={`${speaker.fullName} in ${fact.fact.primaryDate.slice(0, 4)}`}
      desc={fact.fact.title}
      imageAlt={said}
    />
  );
}
