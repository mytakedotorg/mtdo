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
import React, { useEffect, useState } from "react";
import { Social } from "../common/social/social";
import { socialImage } from "../common/social/SocialImage";
import SearchBar from "./SearchBar";

const SOCIAL_CLINTON: Social = {
  cut: [2879, 2891.639892578125],
  fact: "1L4K9lUrKC8dQBxDQTZeIxNEeKIgZjMPaA7SURzBljQ=",
  kind: "videoCut",
};

const SOCIAL_TRUMP: Social = {
  cut: [2689.89990234375, 2702.360107421875],
  fact: "1L4K9lUrKC8dQBxDQTZeIxNEeKIgZjMPaA7SURzBljQ=",
  kind: "videoCut",
};

const CUSTOM_SOCIAL_CLASSNAME = "home";

const Home: React.FC = () => {
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
  return (
    <>
      <WhatIsThis leftSocial={leftSocial} rightSocial={rightSocial} />
      <HowToUseThis />
      <GetInvolved />
    </>
  );
};

export default Home;

interface WhatIsThisProps {
  leftSocial: React.ReactElement;
  rightSocial: React.ReactElement;
}
const WhatIsThis: React.FC<WhatIsThisProps> = (props) => {
  return (
    <HomeSection>
      <h2 className="home__h1 home__h1--center">
        Are we lying to you? Is&nbsp;this&nbsp;out&nbsp;of&nbsp;context?
      </h2>
      <p className="home__body home__body--center">Click one to see</p>
      <div className="home__social-container">
        <a href="/foundation/presidential-debate-clinton-trump-1-of-3/cut:!(2879,2891.639892578125),fact:'1L4K9lUrKC8dQBxDQTZeIxNEeKIgZjMPaA7SURzBljQ=',kind:videoCut">
          {props.leftSocial}
        </a>
        <a href="/foundation/presidential-debate-clinton-trump-1-of-3/cut:!(2689.89990234375,2702.360107421875),fact:'1L4K9lUrKC8dQBxDQTZeIxNEeKIgZjMPaA7SURzBljQ=',kind:videoCut">
          {props.rightSocial}
        </a>
      </div>
      <h2 className="home__h1 home__h1--center">
        Don't let someone else decide&nbsp;for&nbsp;you
      </h2>
      <p className="home__body home__body--center">
        We're not tracking what you've said.
        We're&nbsp;not&nbsp;selling&nbsp;your&nbsp;attention.
      </p>
    </HomeSection>
  );
};

const HowToUseThis: React.FC = () => {
  return (
    <>
      <HomeSection
        containerClassName="home__section--dark"
        innerContainerClassName={"home__searchbar"}
      >
        <h1 className="home__h1 home__body--center">
          Search the issues you care about for&nbsp;yourself
        </h1>
        <SearchBar classModifier="home" placeholder={"Search"} />
        <ul className="home__ul">
          <li className="home__li">
            No editorializing, no filter, no algorithm
          </li>
          <li className="home__li">Just the facts: who said what, and when</li>
          <li className="home__li">
            Search every presidential debate in history (Kennedy/Nixon to
            present), more to come
          </li>
        </ul>
      </HomeSection>
      <HomeSection>
        <h3 className="home__h3">Helpful Tips</h3>
        <ol className="home__ol">
          <li className="home__li">
            Win arguments on social media.
            <div className="home__image-row">
              <img src="/assets/permanent/share-screenshot-e59c4257e9.png" />
              <img src="/assets/permanent/social-screenshot-f102edf99d.png" />
            </div>
          </li>
          <li className="home__li">
            Compare multiple search terms.
            <div className="home__image-row">
              <a href="/search?q=climate%20change">
                <img src="/assets/permanent/climate-change-3259792fdb.svg" />
              </a>
              <a href="/search?q=climate%20change%2C%20global%20warming">
                <img src="/assets/permanent/climate-change-global-warming-9a5ca1a605.svg" />
              </a>
            </div>
          </li>
          <li className="home__li">
            Exclude unhelpful results.
            <div className="home__image-row">
              <a href="/search?q=wall">
                <img src="/assets/permanent/wall-91744a6f80.svg" />
              </a>
              <a href="/search?q=wall%2C%20-wall%20street">
                <img src="/assets/permanent/wall-minus-wall-street-5b731d08ed.svg" />
              </a>
            </div>
          </li>
        </ol>
      </HomeSection>
    </>
  );
};

const GetInvolved: React.FC = () => {
  return (
    <HomeSection containerClassName="home__section--dark">
      <h2 className="home__h2">Get involved</h2>
      <div className="home__link-container">
        <a className="home__link" href="https://meta.mytake.org/c/educators">
          Forum for teachers
        </a>
        <a
          className="home__link"
          href="https://github.com/mytakedotorg/mytakedotorg/blob/staging/DEV_QUICKSTART.md"
        >
          GitHub repo for developers
        </a>
        <a
          className="home__link"
          href="https://meta.mytake.org/c/our-foundation"
        >
          Help us add more facts
        </a>
        <a className="home__link" href="https://meta.mytake.org/c/governance">
          Donate money to keep it running
        </a>
      </div>
    </HomeSection>
  );
};
interface HomeSectionProps {
  containerClassName?: string;
  innerContainerClassName?: string;
}
const HomeSection: React.FC<HomeSectionProps> = ({
  children,
  containerClassName,
  innerContainerClassName,
}) => {
  let outerClass = "home__section";
  if (containerClassName) {
    outerClass += ` ${containerClassName}`;
  }
  let innerClass = "home__section-content";
  if (innerContainerClassName) {
    innerClass += ` ${innerContainerClassName}`;
  }
  return (
    <section className={outerClass}>
      <div className={innerClass}>{children}</div>
    </section>
  );
};

const SocialLoading: React.FC = () => {
  return <div className="social_loading"></div>;
};
