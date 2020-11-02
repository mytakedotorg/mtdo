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
import React, { useEffect, useState } from "react";
import { copyToClipboard } from "../../browser";
import { VideoTurn } from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import HitContent from "./HitContent";

export interface SharePreviewProps {
  contextUrl: string;
  videoTurn: VideoTurn;
  videoFact: FT.VideoFactContent;
}

const SharePreview: React.FC<SharePreviewProps> = ({
  contextUrl,
  videoTurn,
  videoFact,
}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    // Reset `isCopied` state after an interval
    const INTERVAL = 5000;
    let timerId: number | undefined;
    if (isCopied) {
      timerId = window.setTimeout(() => setIsCopied(false), INTERVAL);
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [isCopied]);

  const copyUrl = () => {
    const url =
      window.location.protocol + "//" + window.location.host + contextUrl;
    copyToClipboard(url);
    setIsCopied(true);
  };

  return (
    <div
      className="share-preview"
      style={{ maxWidth: `${window.innerWidth - 16}px` }}
    >
      <div className="share-preview__links">
        <a href={contextUrl}>View full context</a>
        {isCopied ? (
          <span>Copied to clipboard</span>
        ) : (
          <button onClick={copyUrl}>Copy URL to quote</button>
        )}
      </div>
      <div className="share-preview__preview-container">
        <div className="share-preview__label">
          <span>Preview</span>
        </div>
        <div className="share-preview__card">
          <div className="share-preview__avatar">
            <i className="fa fa-user" aria-hidden="true"></i>
          </div>
          <div className="share-preview__preview">
            <p className="share-preview__tilde">∼∼∼ ∼∼∼ ∼∼∼∼∼ ∼∼∼∼∼ ∼∼∼∼∼∼∼∼</p>
            <p className="share-preview__tilde">∼∼ ∼∼∼∼∼∼∼∼ ∼∼ ∼∼∼ ∼ ∼∼∼ ∼∼</p>
            <div className="share-preview__content">
              <HitContent
                className="share-preview__text share-preview__text--app"
                maxLength={200}
                videoTurn={{ ...videoTurn, highlight: undefined }}
                videoFact={videoFact}
              />
            </div>
            <div className="share-preview__content-meta">
              <p className="share-preview__mytake">MyTake.org</p>
              <p className="share-preview__title">
                {videoFact.fact.title} - {videoFact.fact.primaryDate}
              </p>
            </div>
            <div className="share-preview__icons">
              <i className="fa fa-thumbs-up" aria-hidden="true"></i>
              <i className="fa fa-comment" aria-hidden="true"></i>
              <i className="fa fa-share-alt" aria-hidden="true"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePreview;
