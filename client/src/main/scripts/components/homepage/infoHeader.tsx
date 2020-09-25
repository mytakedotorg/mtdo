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
