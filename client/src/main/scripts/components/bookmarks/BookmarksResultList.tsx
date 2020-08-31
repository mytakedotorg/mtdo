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
import { isLoggedIn } from "../../browser";
import { slugify } from "../../common/functions";
import { cutToTurn } from "../../common/video";
import { FT } from "../../java2ts/FT";
import VideoResult, { PlayEvent } from "../shared/VideoResult";
import {
  Bookmark,
  BookmarksResult,
  isBookmarkEqualToSocial,
} from "./bookmarks";

export interface BookmarksResultListEventHandlers {
  onUndoRemoveBookmark(bookmark: Bookmark): void;
  onRemoveBookmark(bookmark: Bookmark): void;
  onPlayClick: PlayEvent;
}

export interface BookmarksResultListProps {
  bookmarksToRemove: Bookmark[];
  bookmarksResult: BookmarksResult;
  eventHandlers: BookmarksResultListEventHandlers;
}

const BookmarksResultList: React.FC<BookmarksResultListProps> = ({
  bookmarksToRemove,
  bookmarksResult,
  eventHandlers,
}) => {
  const handleBookmarkClick = (bookmark: Bookmark, isBookmarked: boolean) => {
    if (isLoggedIn()) {
      isBookmarked
        ? eventHandlers.onRemoveBookmark(bookmark)
        : eventHandlers.onUndoRemoveBookmark(bookmark);
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
                  isBookmarked={
                    !bookmarksToRemove.find((b) =>
                      isBookmarkEqualToSocial(b, h.bookmark.content)
                    )
                  }
                  bookmark={h.bookmark}
                  key={getUniqueKey(h.fact, videoTurn.turn, videoTurn.cut)}
                  eventHandlers={{
                    onPlayClick: eventHandlers.onPlayClick,
                    onBookmarkClick: handleBookmarkClick,
                  }}
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
