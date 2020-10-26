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
        <h1 className="home__h1 home__h1--search">
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
    </>
  );
};

export default HowToUseThis;
