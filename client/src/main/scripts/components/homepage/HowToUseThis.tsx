import React from "react";
import SearchBar from "../SearchBar";
import HomeSection from "./HomeSection";

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

export default HowToUseThis;
