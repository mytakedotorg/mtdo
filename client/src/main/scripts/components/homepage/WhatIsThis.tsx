import React from "react";
import HomeSection from "./HomeSection";

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

export default WhatIsThis;
