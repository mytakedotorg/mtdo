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
import { Bookmark as BookmarkIcon, Play, Share } from "react-feather";
import { isLoggedIn } from "../../browser";
import { slugify } from "../../common/functions";
import { encodeSocial, VideoCut, VideoTurn } from "../../common/social/social";
import {
  convertSecondsToTimestamp,
  getSpeaker,
  turnToCut,
} from "../../common/video";
import { FT } from "../../java2ts/FT";
import { Routes } from "../../java2ts/Routes";
import {
  convertMillisecondsToSeconds,
  convertSecondsToMilliseconds,
} from "../../utils/conversions";
import { Bookmark, BookmarksClient } from "../bookmarks/bookmarks";
import DropDown from "../DropDown";
import HitContent from "./HitContent";
import SharePreview from "./SharePreview";

export type PlayEvent = (
  videoFact: FT.VideoFactContent,
  clipRange: [number, number]
) => any;

export interface VideoResultProps {
  bookmarks: Bookmark[];
  videoTurn: VideoTurn;
  videoFact: FT.VideoFactContent;
  onPlayClick: PlayEvent;
}

const VideoResult: React.FC<VideoResultProps> = (props) => {
  const { bookmarks, onPlayClick, videoFact, videoTurn } = props;
  const social = turnToCut(videoTurn, videoFact);

  const contextUrl = `${Routes.FOUNDATION}/${slugify(
    videoFact.fact.title
  )}/${encodeSocial(social)}`;

  const handlePlayClick = () => {
    onPlayClick(videoFact, social.cut);
  };

  const handleBookmarkClick = () => {
    if (isLoggedIn()) {
      new BookmarksClient().add([
        {
          fact: videoTurn.fact,
          start: convertSecondsToMilliseconds(social.cut[0]),
          end: convertSecondsToMilliseconds(social.cut[1]),
          savedAt: new Date().toISOString(),
        },
      ]);
    } else {
      throw "TODO: launch a login modal and then add";
    }
  };

  const isBookmarked =
    bookmarks.findIndex((b) => isBookmarkEqualToSocial(b, social)) !== -1;
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

function isBookmarkEqualToSocial(
  bookmark: Bookmark,
  social: VideoCut
): boolean {
  const normalizedSocialCut = social.cut.map((t) =>
    convertMillisecondsToSeconds(convertSecondsToMilliseconds(t))
  );
  return (
    bookmark.content.fact === social.fact &&
    bookmark.content.kind === social.kind &&
    bookmark.content.cut[0] === normalizedSocialCut[0] &&
    bookmark.content.cut[1] === normalizedSocialCut[1]
  );
}
export default VideoResult;
