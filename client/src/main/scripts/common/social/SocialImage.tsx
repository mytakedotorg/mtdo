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
import { abbreviate } from "../functions";
import { FactUncut, Social, TextCut, VideoCut } from "../social/social";

export async function socialImage(social: Social): Promise<React.ReactElement> {
  switch (social.kind) {
    case "textCut":
      return imageTextCut(
        social,
        await FoundationFetcher.justOneDocument(social.fact)
      );
    case "videoCut":
      return imageVideoCut(
        social,
        await FoundationFetcher.justOneVideo(social.fact)
      );
    case "factUncut":
      return imageFactUncut(
        social,
        await FoundationFetcher.justOneFact(social.fact)
      );
  }
}

function imageTextCut(
  social: TextCut,
  fact: FT.DocumentFactContent
): React.ReactElement {
  return <div className="todo"></div>;
}

function imageVideoCut(
  social: VideoCut,
  fact: FT.VideoFactContent
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
  return (
    <div className="social">
      <div className="social__content">
        <div className="social__row social__row--quote">
          <div className="social__quote-container">
            <span className={`social__quote social__quote--${classModifier}`}>
              &ldquo;
            </span>
          </div>
          <p className={`social__text social__text--${classModifier}`}>
            {abbreviate(said, 420)}
          </p>
        </div>
        <div className="social__row">
          <p className="social__speaker">{speaker.fullName}</p>
        </div>
      </div>
      <div className="social__background"></div>
      <div className="social__image-container">
        <img
          className="social__image"
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
