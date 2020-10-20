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
          The{" "}
          <a href="https://github.com/mytakedotorg/mtdo/blob/staging/DEV_QUICKSTART.md">
            open source
          </a>{" "}
          political&nbsp;search&nbsp;engine
        </h1>
        <SearchBar classModifier="home" placeholder={"Search"} />
        <ul className="home__ul">
          <li className="home__li">
            No editorializing, no filter, no algorithm
          </li>
          <li className="home__li">Just the facts: who said what, and when</li>
          <li className="home__li">
            Search every{" "}
            <a href="https://github.com/mytakedotorg/us-presidential-debates">
              presidential debate in history
            </a>
            , more to come
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
              <a href="/search?q=second%20amendment">
                <img src="/assets/permanent/second-amendment-f5f7f5a517.svg" />
              </a>
              <a href="/search?q=second%20amendment%2C%20gun%20control">
                <img src="/assets/permanent/second-amendment-gun-control-80e7e6fada.svg" />
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
