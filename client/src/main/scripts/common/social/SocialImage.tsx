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
  return (
    <div className="share-preview__content share-preview__content--embed">
      <p className="share-preview__text share-preview__text--embed">
        {abbreviate(said, 590)}
      </p>
      <p className="share-preview__speaker">-{speaker.fullName}</p>
    </div>
  );
}

function imageFactUncut(
  social: FactUncut,
  fact: FT.DocumentFactContent | FT.VideoFactContent
): React.ReactElement {
  return <div className="todo"></div>;
}
