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
import { Bookmark } from "../bookmarks/bookmarks";
import VideoResult, { VideoResultEventHandlers } from "../shared/VideoResult";
import { SearchResult } from "./search";

export interface VideoResultsListProps {
  bookmarks: Bookmark[];
  dateToDivMap: Map<string, HTMLDivElement>;
  searchResult: SearchResult;
  eventHandlers: VideoResultEventHandlers;
}

const VideoResultsList: React.FC<VideoResultsListProps> = ({
  bookmarks,
  dateToDivMap,
  eventHandlers,
  searchResult,
}) => {
  const { factHits } = searchResult;
  return (
    <>
      {factHits.map((f) => {
        const results = f.searchHits.map((h) => {
          return (
            <VideoResult
              bookmarks={bookmarks}
              key={getUniqueKey(
                f.videoFact.youtubeId,
                h.videoTurn.turn,
                h.videoTurn.cut
              )}
              eventHandlers={eventHandlers}
              videoFact={h.videoFact}
              videoTurn={h.videoTurn}
            />
          );
        });
        return results.length > 0 ? (
          <div
            className="results__preview"
            key={f.videoFact.youtubeId}
            ref={(div: HTMLDivElement) => {
              const date = f.videoFact.fact.primaryDate;
              if (!dateToDivMap.has(date)) {
                dateToDivMap.set(date, div);
              }
            }}
          >
            <h2 className="results__subheading">
              {f.videoFact.fact.title} - {f.videoFact.fact.primaryDate}
            </h2>
            {results}
          </div>
        ) : null;
      })}
    </>
  );
};

const getUniqueKey = (
  youtubeId: string,
  turn: number,
  hitOffsets: [number, number]
): string => {
  return `${youtubeId}.${turn}.${hitOffsets[0]}.${hitOffsets[1]}`;
};

export default VideoResultsList;
