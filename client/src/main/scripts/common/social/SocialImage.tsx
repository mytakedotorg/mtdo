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
import { abbreviate } from "../functions";
import {
  FactUncut,
  Social,
  TextCut,
  VideoCut,
  SearchResults,
} from "../social/social";
import { search } from "../../components/search/search";
import {
  getNumberOfHitsPerYear,
  NGramViewerPresentation,
} from "../../components/search/NGramViewer";

export async function socialImage(
  social: Social,
  customClass?: string
): Promise<React.ReactElement> {
  switch (social.kind) {
    case "textCut":
      return imageTextCut(
        social,
        await Foundation.justOneDocument(social.fact)
      );
    case "videoCut":
      return imageVideoCut(
        social,
        await Foundation.justOneVideo(social.fact),
        customClass
      );
    case "factUncut":
      return imageFactUncut(social, await Foundation.justOneFact(social.fact));
    case "searchResults":
      return imageSearchResults(social);
  }
}

function imageTextCut(
  social: TextCut,
  fact: FT.DocumentFactContent
): React.ReactElement {
  return <div className="todo"></div>;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const ths = ["th", "st", "nd", "rd", "th", "th", "th", "th", "th", "th"];
function dateIsoToFormal(fact: FT.VideoFactContent): string {
  const matcher = fact.fact.primaryDate.match(/(\d+)-(\d+)-(\d+)/)!;
  const year = matcher[1];
  const month = parseInt(matcher[2]) - 1;
  const day = parseInt(matcher[3]);
  return `${months[month]} ${ordinal(day)}, ${year}`;
}

function ordinal(number: number): string {
  if (number <= 0) {
    throw "only supports positive integers";
  }
  if (number > 3 && number < 21) {
    // special handling for the teens
    return number + "th";
  }
  const lastDigit = number % 10;
  switch (lastDigit) {
    case 1:
      return number + "st";
    case 2:
      return number + "nd";
    case 3:
      return number + "rd";
    default:
      return number + "th";
  }
}

export function imageVideoCut(
  social: VideoCut,
  fact: FT.VideoFactContent,
  customClass: string = ""
): React.ReactElement {
  const [speaker, said] = getCut(fact, social.cut);
  let classModifier: string;
  if (said.length <= 75) {
    classModifier = "a";
  } else if (said.length <= 96) {
    classModifier = "b";
  } else if (said.length <= 140) {
    classModifier = "c";
  } else if (said.length <= 150) {
    classModifier = "d";
  } else if (said.length <= 200) {
    classModifier = "e";
  } else if (said.length <= 300) {
    classModifier = "f";
  } else {
    classModifier = "z";
  }
  const date = new Date(fact.fact.primaryDate);
  return (
    <div className={`social ${customClass}`}>
      <div className={`social__content ${customClass}`}>
        <div className={`social__row social__row--quote ${customClass}`}>
          <div className={`social__quote-container ${customClass}`}>
            <span
              className={`social__quote social__quote--${classModifier} ${customClass}`}
            >
              &ldquo;
            </span>
          </div>
          <p
            className={`social__text social__text--${classModifier} ${customClass}`}
          >
            {abbreviate(said, 420)}
          </p>
        </div>
        <div className={`social__row ${customClass}`}>
          <p className={`social__speaker ${customClass}`}>{speaker.fullName}</p>
          <p className={`social__date ${customClass}`}>
            {dateIsoToFormal(fact)}
          </p>
        </div>
      </div>
      <div className={`social__background ${customClass}`}></div>
      <div className={`social__image-container ${customClass}`}>
        <img
          className={`social__image ${customClass}`}
          src="https://mytake.org/assets/permanent/square-wheat-482248dddd.png"
          width="200"
          height="200"
          alt="MyTake.org | Fundamentals, in context."
        />
      </div>
    </div>
  );
}

function imageFactUncut(
  social: FactUncut,
  fact: FT.DocumentFactContent | FT.VideoFactContent
): React.ReactElement {
  return <div className="todo"></div>;
}

async function imageSearchResults(
  social: SearchResults,
  customClass: string = ""
): Promise<React.ReactElement> {
  const result = await search(social.query);
  const hitsPerYear = await getNumberOfHitsPerYear(result);
  return (
    <div className={`social ${customClass}`}>
      <div className={`social__content ${customClass}`}>
        <NGramViewerPresentation
          hitsPerYearList={hitsPerYear}
          classModifier={"home"}
          showHelpText={false}
        />
      </div>
      <div className={`social__row ${customClass}`}>
        <p className={`social__speaker ${customClass}`}>{social.query}</p>
      </div>
      <div className={`social__background ${customClass}`}></div>
      <div className={`social__image-container ${customClass}`}>
        <img
          className={`social__image ${customClass}`}
          src="https://mytake.org/assets/permanent/square-wheat-482248dddd.png"
          width="200"
          height="200"
          alt="MyTake.org | Fundamentals, in context."
        />
      </div>
    </div>
  );
}
