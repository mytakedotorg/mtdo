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
import AnimatedHeading from "./AnimatedHeading";
import BlinkingCursor from "./BlinkingCursor";
import HomeSection from "./HomeSection";

interface WhatIsThisProps {
  leftSocial: React.ReactElement;
  rightSocial: React.ReactElement;
}

const WhatIsThis: React.FC<WhatIsThisProps> = (props) => {
  return (
    <HomeSection>
      <h2 className="home__h1 home__h1--animated">
        Are we lying to you? <AnimatedHeading />
        <BlinkingCursor />
      </h2>
      <p className="home__body home__body--center">Click one to see</p>
      <div className="home__social-container">
        <a href="/foundation/presidential-debate-clinton-trump-1-of-3/~cut:(2879,2891.639892578125),fact:E74aoUY=887eb256a26aa4be39a9d849804b8e6e418222ae,kind:videoCut">
          {props.leftSocial}
        </a>
        <a href="/foundation/presidential-debate-clinton-trump-1-of-3/~cut:(2689.89990234375,2702.360107421875),fact:E74aoUY=887eb256a26aa4be39a9d849804b8e6e418222ae,kind:videoCut">
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

export default WhatIsThis;
