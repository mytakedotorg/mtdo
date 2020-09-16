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
import { Search, XCircle } from "react-feather";
import { Routes } from "../java2ts/Routes";

interface SearchBarProps {
  classModifier?: string;
  placeholder?: string;
  initialSearchQuery?: string;
}

const SEARCH_TERM_LIMIT = 5;
const SearchBar: React.FC<SearchBarProps> = ({
  classModifier,
  placeholder,
  initialSearchQuery,
}) => {
  const [inputValue, setInputValue] = useState<string>(
    initialSearchQuery || ""
  );
  const BEMModifier = classModifier || "";

  const clearSearch = () => {
    setInputValue("");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchQuery = inputValue
      .split(",")
      .filter((_, index) => index < SEARCH_TERM_LIMIT)
      .join(",");

    window.location.href =
      Routes.SEARCH +
      "?q=" +
      encodeURIComponent(searchQuery || "");
  };

  let searchCancelClass = `searchbar__cancel searchbar__cancel--${BEMModifier}`;
  if (!inputValue) {
    searchCancelClass += " searchbar__cancel--hidden";
  }
  return (
    <form
      className={`searchbar__form searchbar__form--${BEMModifier}`}
      onSubmit={handleSubmit}
      action="javascript:void(0)" // Required for iOS search keyboard
    >
      <div
        className={`searchbar__input-container searchbar__input-container--${BEMModifier}`}
      >
        <input
          className={`searchbar__input searchbar__input--${BEMModifier}`}
          type="search"
          value={inputValue}
          placeholder={placeholder}
          results={5}
          onChange={handleChange}
        />
        <span className={searchCancelClass} onClick={clearSearch}>
          <XCircle />
        </span>
      </div>
      <button
        type="submit"
        className={`searchbar__button searchbar__button--${BEMModifier}`}
      >
        <span className={`searchbar__text searchbar__text--${BEMModifier}`}>
          Search
        </span>
        <Search className={`searchbar__icon searchbar__icon--${BEMModifier}`} />
      </button>
    </form>
  );
};

export default SearchBar;
