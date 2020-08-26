/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
import { slugify } from "../../common/functions";
import { cutToTurn } from "../../common/video";
import { FT } from "../../java2ts/FT";
import VideoResult, { PlayEvent } from "../shared/VideoResult";
import { BookmarksResult } from "./bookmarks";

export interface BookmarksResultListProps {
  bookmarksResult: BookmarksResult;
  onPlayClick: PlayEvent;
}

const BookmarksResultList: React.FC<BookmarksResultListProps> = ({
  bookmarksResult,
  onPlayClick,
}) => {
  return (
    <>
      {bookmarksResult.factHits.map((f, idx) => {
        const results = f.bookmarkHits.map((h) => {
          switch (h.bookmark.content.kind) {
            case "videoCut":
              const videoTurn = cutToTurn(
                h.bookmark.content,
                h.fact as FT.VideoFactContent
              );
              return (
                <VideoResult
                  key={getUniqueKey(h.fact, videoTurn.turn, videoTurn.cut)}
                  onPlayClick={onPlayClick}
                  videoFact={h.fact as FT.VideoFactContent}
                  videoTurn={videoTurn}
                />
              );
          }
        });
        return results.length > 0 ? (
          <div className="results__preview" key={idx}>
            <h2 className="results__subheading">
              {f.bookmarkHits[0].fact.fact.title} -{" "}
              {f.bookmarkHits[0].fact.fact.primaryDate}
            </h2>
            {results}
          </div>
        ) : null;
      })}
    </>
  );
};

const getUniqueKey = (
  fact: FT.VideoFactContent | FT.DocumentFactContent,
  turn: number,
  hitOffsets: [number, number]
): string => {
  return `${slugify(fact.fact.title)}.${turn}.${hitOffsets[0]}.${
    hitOffsets[1]
  }`;
};

export default BookmarksResultList;
