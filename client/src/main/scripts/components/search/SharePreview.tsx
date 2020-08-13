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
import React from "react";

interface SharePreviewProps {}

const SharePreview: React.FC<SharePreviewProps> = (props) => {
  return (
    <div
      className="share-preview"
      style={{ maxWidth: `${window.innerWidth - 16}px` }}
    >
      <div className="share-preview__links">
        <a href="#">View full context</a>
        <a href="#">Copy URL to quote</a>
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
              <p>
                Some text here that's useful. Some text here that's useful. Some
                text here that's useful. Some text here that's useful. Some text
                here that's useful. Some text here that's useful. Some text here
                that's useful.{" "}
              </p>
            </div>
            <div className="share-preview__content-meta">
              <p className="share-preview__mytake">MyTake.org</p>
              <p className="share-preview__title">Some debate title here</p>
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
