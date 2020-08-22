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
import * as React from "react";
import { Routes } from "../../java2ts/Routes";

export const DIM_OG = [1200, 628];
export const DIM_TWITTER = [1200, 600];

export interface HeaderTagsProps {
  url: string;
  rison: string;
  title: string;
  desc: string;
  imageAlt: string;
  creatorTwitter?: string;
}

export const HeaderTags: React.FC<HeaderTagsProps> = (props) => {
  const og: OgProps = {
    title: props.title,
    url: props.url,
    image: `https://node.mytake.org${Routes.PATH_NODE_SOCIAL_IMAGE}${props.rison}.png`,
    imageAlt: props.imageAlt,
  };
  const twit: TwitterProps = {
    creator: props.creatorTwitter,
    title: props.title,
    desc: props.desc,
    image: `https://node.mytake.org${Routes.PATH_NODE_SOCIAL_IMAGE_TWITTER}${props.rison}.png`,
    imageAlt: props.imageAlt,
  };
  return (
    <header>
      <meta property="og:title" content={og.title} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={og.url} />
      <meta property="og:image" content={og.image} />
      <meta property="og:image:secure_url" content={og.image} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content={DIM_OG[0].toString()} />
      <meta property="og:image:height" content={DIM_OG[1].toString()} />
      <meta property="og:image:alt" content={og.imageAlt} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@mytakedotorg" />
      {twit.creator && <meta name="twitter:creator" content={twit.creator} />}
      <meta name="twitter:title" content={twit.title} />
      <meta name="twitter:description" content={twit.desc} />
      <meta name="twitter:image" content={twit.image} />
      <meta name="twitter:image:alt" content={twit.imageAlt} />
    </header>
  );
};

// https://ogp.me/
interface OgProps {
  title: string;
  url: string;
  image: string;
  imageAlt: string;
}

// https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/summary-card-with-large-image
interface TwitterProps {
  /** Needs to start with @ */
  creator?: string;
  title: string;
  /** A description that concisely summarizes the content as appropriate for presentation within a Tweet. You should not re-use the title as the description or use this field to describe the general services provided by the website. Platform specific behaviors:
          iOS, Android: Not displayed
          Web: Truncated to three lines in timeline and expanded Tweet */
  desc: string;
  image: string;
  /** Max 420 characters. */
  imageAlt: string;
}
