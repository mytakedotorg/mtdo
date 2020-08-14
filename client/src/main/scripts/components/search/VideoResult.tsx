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
import * as React from "react";
import { Bookmark, Play, Share } from "react-feather";
import { slugify } from "../../common/functions";
import { convertSecondsToTimestamp } from "../../common/video";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import DropDown from "../DropDown";
import { SearchHit } from "./search";
import SharePreview from "./SharePreview";

export type PlayEvent = (
  videoFact: FT.VideoFactContent,
  clipRange: [number, number]
) => any;

export interface VideoResultProps {
  isBookmarked?: boolean;
  searchHit: SearchHit;
  onPlayClick: PlayEvent;
}

const VideoResult: React.FC<VideoResultProps> = (props) => {
  const { isBookmarked, onPlayClick, searchHit } = props;
  const { videoFact } = searchHit;
  const clipRange = searchHit.getClipRange();

  const handlePlayClick = () => {
    onPlayClick(videoFact, clipRange);
  };

  const handleShareClick = () => {
    console.log("todo");
  };

  const open = () => {
    window.location.href =
      Routes.FOUNDATION_V1 +
      "/" +
      slugify(videoFact.fact.title) +
      "/" +
      clipRange[0].toFixed(3) +
      "-" +
      clipRange[1].toFixed(3);
  };

  const handleBookmarkClick = () => {
    console.log("TODO");
  };

  let bookmarkClass = "turn__button turn__button--bookmark";
  if (isBookmarked) {
    bookmarkClass += " turn__button--bookmark-solid";
  }
  return (
    <div className="turn">
      <div className="turn__info">
        <div className="turn__info-row">
          <h3 className="turn__speaker">{searchHit.getSpeaker()}</h3>
          <DropDown
            classModifier="share"
            dropdownPosition="CUSTOM"
            toggleText={<Share />}
          >
            <SharePreview />
          </DropDown>
        </div>
        <div className="turn__info-row turn__info-row--short">
          <span className="turn__time">
            {convertSecondsToTimestamp(clipRange[0]) +
              " - " +
              convertSecondsToTimestamp(clipRange[1])}
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
            <Bookmark />
          </button>
        </div>
      </div>
      <p className="turn__results">
        {searchHit.getContent().map((hitContent) => {
          return hitContent.isHighlighted ? (
            <strong key={hitContent.text}>{hitContent.text}</strong>
          ) : (
            hitContent.text
          );
        })}
      </p>
    </div>
  );
};

export default VideoResult;
