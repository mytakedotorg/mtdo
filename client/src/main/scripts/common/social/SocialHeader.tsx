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
import { Foundation } from "../../common/foundation";
import { getCut } from "../../common/video";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import {
  FactUncut,
  Social,
  TextCut,
  VideoCut,
  SearchResults,
} from "../social/social";
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
        await Foundation.justOneDocument(social.fact)
      );
    case "videoCut":
      return headerVideoCut(
        social,
        socialRison,
        await Foundation.justOneVideo(social.fact)
      );
    case "factUncut":
      return headerFactUncut(
        social,
        socialRison,
        await Foundation.justOneFact(social.fact)
      );
    case "searchResults":
      return headerSearchResults(social, socialRison);
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
  let factDesc;
  if (fact.location) {
    factDesc = `${fact.location.placename} in ${fact.location.cityState}`;
  } else if (fact.notes) {
    factDesc = fact.notes;
  } else {
    factDesc = `Unknown location`;
  }
  return (
    <HeaderTags
      url={`https://mytake.org/foundation/${socialRison}`}
      rison={socialRison}
      title={`${fact.factset.title} | ${fact.fact.title}`}
      desc={factDesc}
      imageAlt={said}
    />
  );
}

export function headerSearchResults(
  social: SearchResults,
  socialRison: string
): React.ReactElement {
  return (
    <HeaderTags
      url={`https://mytake.org/search?q=${encodeURIComponent(social.query)}`}
      rison={socialRison}
      title={`"${social.query}" in presidential debates`}
      desc={`Every single time that "${social.query}" was said in a presidential debate, ever.`}
      imageAlt={`A bar graph of how many times "${social.query}" was said in a presidential debate.`}
    />
  );
}
