/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
import React, { useEffect } from "react";
import VideoResultTurnList from "./VideoResultTurnList";
import { SelectionOptions } from "./VideoResultsList";
import { PlayEvent } from "./VideoResult";
import { Foundation } from "../java2ts/Foundation";

export interface VideoResultPreviewEventHandlers {
  onPlayClick: PlayEvent;
  onReady?: (youtubeId: string) => any;
}

interface VideoResultPreviewProps {
  eventHandlers: VideoResultPreviewEventHandlers;
  searchTerm: string;
  sortBy: SelectionOptions;
  turns: number[];
  videoFact: Foundation.VideoFactContent;
}

const VideoResultPreview: React.FC<VideoResultPreviewProps> = (props) => {
  useEffect(() => {
    if (props.eventHandlers.onReady) {
      props.eventHandlers.onReady(props.videoFact.youtubeId);
    }
  }, []);

  const { searchTerm, sortBy, turns, videoFact } = props;
  return (
    <div className="results__preview">
      <h2 className="results__subheading">
        {videoFact.fact.title} - {videoFact.fact.primaryDate}
      </h2>
      {turns.map((turn, idx) => {
        return (
          <VideoResultTurnList
            key={idx.toString()}
            onPlayClick={props.eventHandlers.onPlayClick}
            searchTerm={searchTerm}
            sortBy={sortBy}
            turn={turn}
            videoFact={videoFact}
          />
        );
      })}
    </div>
  );
};

export default VideoResultPreview;
