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
import { Bookmark as BookmarkIcon, Play, Share } from "react-feather";
import { slugify } from "../../common/functions";
import { encodeSocial, VideoTurn } from "../../common/social/social";
import { convertSecondsToTimestamp, getSpeaker } from "../../common/video";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import { Bookmark } from "../bookmarks/bookmarks";
import DropDown from "../DropDown";
import HitContent from "./HitContent";
import SharePreview from "./SharePreview";

export interface VideoResultEventHandlers {
  onBookmarkClick(bookmark: Bookmark, isBookmarked: boolean): void;
  onPlayClick: PlayEvent;
}

export type PlayEvent = (
  videoFact: FT.VideoFactContent,
  clipRange: [number, number]
) => any;

export interface VideoResultProps {
  bookmark: Bookmark;
  isBookmarked: boolean;
  videoTurn: VideoTurn;
  videoFact: FT.VideoFactContent;
  eventHandlers: VideoResultEventHandlers;
}

const VideoResult: React.FC<VideoResultProps> = (props) => {
  const { bookmark, isBookmarked, eventHandlers, videoFact, videoTurn } = props;

  const social = bookmark.content;

  const contextUrl = `${Routes.FOUNDATION}/${slugify(
    videoFact.fact.title
  )}/${encodeSocial(social)}`;

  const handlePlayClick = () => {
    eventHandlers.onPlayClick(videoFact, social.cut);
  };

  const handleBookmarkClick = () => {
    eventHandlers.onBookmarkClick(bookmark, isBookmarked);
  };

  let bookmarkClass = "turn__button turn__button--bookmark";
  if (isBookmarked) {
    bookmarkClass += " turn__button--bookmark-solid";
  }
  return (
    <div className="turn">
      <div className="turn__info">
        <div className="turn__info-row">
          <h3 className="turn__speaker">{getSpeaker(videoTurn, videoFact)}</h3>
          <DropDown
            classModifier="share"
            dropdownPosition="CUSTOM"
            toggleText={<Share />}
          >
            <SharePreview
              contextUrl={contextUrl}
              videoFact={videoFact}
              videoTurn={videoTurn}
            />
          </DropDown>
        </div>
        <div className="turn__info-row turn__info-row--short">
          <span className="turn__time">
            {convertSecondsToTimestamp(social.cut[0]) +
              " - " +
              convertSecondsToTimestamp(social.cut[1])}
          </span>
        </div>
        <div className="turn__info-row">
          <button
            className="turn__button turn__button--play"
            onClick={handlePlayClick}
          >
            <Play size={20} />
          </button>
          <button className={bookmarkClass} onClick={handleBookmarkClick}>
            <BookmarkIcon />
          </button>
        </div>
      </div>
      <HitContent
        className="turn__results"
        videoFact={videoFact}
        videoTurn={videoTurn}
      />
    </div>
  );
};

export default VideoResult;
