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
import { Bookmark } from "../bookmarks/bookmarks";
import DropDown from "../DropDown";
import HitContent from "./HitContent";
import SharePreview from "./SharePreview";

export interface VideoResultEventHandlers {
  onAddBookmark(bookmark: Bookmark): void;
  onPlayClick: PlayEvent;
  onRemoveBookmark(bookmark: Bookmark): void;
}

export type PlayEvent = (
  videoFact: FT.VideoFactContent,
  clipRange: [number, number]
) => any;

export interface VideoResultProps {
  bookmarks: Bookmark[];
  videoTurn: VideoTurn;
  videoFact: FT.VideoFactContent;
  eventHandlers: VideoResultEventHandlers;
}

const VideoResult: React.FC<VideoResultProps> = (props) => {
  const { bookmarks, eventHandlers, videoFact, videoTurn } = props;
  const social = turnToCut(videoTurn, videoFact);
  const bookmark: Bookmark | undefined = bookmarks.find((b) =>
    isBookmarkEqualToSocial(b, social)
  );

  if (videoTurn.fact === "6Gh5BNxWMs8Ole1dqb_u2DJO2vKTEtjT7Cde7wcnt-o=") {
    console.log(bookmark);
    console.log(social);
    if (bookmark) {
      console.log(isBookmarkEqualToSocial(bookmark, social));
    }
  }

  const contextUrl = `${Routes.FOUNDATION}/${slugify(
    videoFact.fact.title
  )}/${encodeSocial(social)}`;

  const handlePlayClick = () => {
    eventHandlers.onPlayClick(videoFact, social.cut);
  };

  const handleBookmarkClick = () => {
    if (isLoggedIn()) {
      if (bookmark) {
        eventHandlers.onRemoveBookmark(bookmark);
      } else {
        eventHandlers.onAddBookmark({
          content: social,
          savedAt: new Date(),
        });
      }
    } else {
      console.warn("TODO: launch a login modal and then add");
      /**
       * Get user's email then,
       *   1. They have an existing confirmed account.
       *     - response modal "There is a login link in your email. Click that to continue."
       *   2. They have an existing unconfirmed account.
       *     - response modal "There is a login link in your email. Click that to continue.
       *                      You haven't confirmed your account yet. You have X hours left
       *                      to confirm your account"
       *   3. They have no account.
       *     - Onboarding opportunity.
       *   4. They've been blocked or rate limited.
       *   5. Had an account and never confirmed.
       *
       *  Routes.API_LOGIN response is LoginCookie | { title: string, body: string} ("Welcome Back", "Go check your email");
       */
    }
  };

  let bookmarkClass = "turn__button turn__button--bookmark";
  if (bookmark) {
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
