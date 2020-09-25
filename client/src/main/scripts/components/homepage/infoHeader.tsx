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

export interface Tab {
  tabTitle: string;
  component?: React.Component;
}

export const INFO_HEADER_TABS: Tab[] = [
  {
    tabTitle: "How to use this",
  },
  {
    tabTitle: "What is this",
  },
  {
    tabTitle: "Get involved",
  },
];

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
  return <div className="social_loading"></div>;
};
