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
import React, { useState } from "react";
import { Routes } from "../java2ts/Routes";

const PLACEHOLDER_SEARCH_QUERY = "wall, -wall street";

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const clearSearch = () => {
    setSearchQuery("");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    window.location.href =
      Routes.SEARCH +
      "?q=" +
      encodeURIComponent(searchQuery || PLACEHOLDER_SEARCH_QUERY);
  };

  let searchCancelClass = "home__search-clear";
  if (!searchQuery) {
    searchCancelClass += " home__search-clear--hidden";
  }
  return (
    <>
      <HomeSection innerContainerClassName={"home__searchbar"}>
        <h1 className="home__heading">Search the Foundation</h1>
        <form
          className="home__search-form"
          onSubmit={handleSubmit}
          action="javascript:void(0)" // Required for iOS search keyboard
        >
          <input
            className="home__search-input"
            type="search"
            value={searchQuery}
            placeholder={PLACEHOLDER_SEARCH_QUERY}
            results={5}
            onChange={handleChange}
          />
          <span className={searchCancelClass} onClick={clearSearch}>
            <i className="fa fa-times-circle" aria-hidden="true" />
          </span>
          <button type="submit" className="home__search-button">
            <i className="fa fa-search" aria-hidden="true" />
          </button>
        </form>
      </HomeSection>
      <HomeSection containerClassName="hero">
        <div className="home__boxes">
          <p>
            Use commas between search terms. E.g. "climate change, global
            warming".
          </p>
          <p>
            Use a minus sign to exclude a search term. E.g. "wall, -wall street"
            will include anything about a wall except for Wall Street.
          </p>
        </div>
      </HomeSection>
    </>
  );
};

export default Home;

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