import React from "react";
import HomeSection from "./HomeSection";

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

export default GetInvolved;
