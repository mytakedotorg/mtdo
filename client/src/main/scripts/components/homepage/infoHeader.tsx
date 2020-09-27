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
import { VideoCut } from "../../common/social/social";
import { socialImage } from "../../common/social/SocialImage";

export enum INFO_HEADER_TABS_ENUM {
  HOW_TO_USE_THIS = "How to use this",
  WHAT_IS_THIS = "What is this",
  GET_INVOLVED = "Get involved",
}

export const INFO_HEADER_TAB_NAMES = Object.values(INFO_HEADER_TABS_ENUM);

export const SOCIAL_CLINTON: VideoCut = {
  cut: [2879, 2891.639892578125],
  fact: "1L4K9lUrKC8dQBxDQTZeIxNEeKIgZjMPaA7SURzBljQ=",
  kind: "videoCut",
};

export const SOCIAL_TRUMP: VideoCut = {
  cut: [2689.89990234375, 2702.360107421875],
  fact: "1L4K9lUrKC8dQBxDQTZeIxNEeKIgZjMPaA7SURzBljQ=",
  kind: "videoCut",
};

const CUSTOM_SOCIAL_CLASSNAME = "home";

export interface HomeSocials {
  leftSocial: React.ReactElement;
  rightSocial: React.ReactElement;
}
export const useSocials = (): HomeSocials => {
  const [leftSocial, setLeftSocial] = useState<React.ReactElement>(
    <SocialLoading />
  );
  const [rightSocial, setRightSocial] = useState<React.ReactElement>(
    <SocialLoading />
  );
  useEffect(() => {
    const loadImages = async () => {
      setLeftSocial(await socialImage(SOCIAL_CLINTON, CUSTOM_SOCIAL_CLASSNAME));
      setRightSocial(await socialImage(SOCIAL_TRUMP, CUSTOM_SOCIAL_CLASSNAME));
    };
    loadImages();
  }, []);

  return { leftSocial, rightSocial };
};

export const SocialLoading: React.FC = () => {
  return (
    <div className="social home">
      <div className="social__content home">
        <div className={`social__row social__row--quote home`}>
          <div className={`social__quote-container home`}>
            <span className={`social__quote social__quote--a home`}>
              &ldquo;
            </span>
          </div>
          <p className={`social__text social__text--a home`}>
            ~~~~ ~~~~ ~~~~~~~~ ~~~ ~~~~~~~~ ~~~~ ~~~~ ~~~~~~~~ ~~~~ ~~ ~~~~~~~~
            ~~~~ ~~~~~ ~~~~~~~~ ~~~ ~~~~~~ ~~~~~~~~~ ~~~~ ~~~~~ ~~~~~~~~ ~~~
            ~~~~~~ ~~~~~~~~~
          </p>
        </div>
        <div className={`social__row home`}>
          <p className={`social__speaker home`}>~~~~~~</p>
        </div>
      </div>
      <div className={`social__background home`}></div>
      <div className={`social__image-container home`}>
        <img
          className={`social__image home`}
          src="https://mytake.org/assets/permanent/square-wheat-482248dddd.png"
          width="200"
          height="200"
          alt="MyTake.org | Fundamentals, in context."
        />
      </div>
    </div>
  );
};
