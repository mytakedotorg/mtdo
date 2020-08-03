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
import * as React from "react";
import { SearchMode } from "./search";

interface SearchRadioButtonsProps {
  onChange(mode: SearchMode): void;
  selectedOption: SearchMode;
}

const SearchRadioButtons: React.StatelessComponent<SearchRadioButtonsProps> = (
  props
) => {
  return (
    <div className="searchradio">
      <div className="searchradio__actions">
        <div className="searchradio__group">
          <input
            type="radio"
            id="radio--containing"
            className="searchradio__radio"
            name="type"
            value="Containing"
            onChange={() => props.onChange(SearchMode.Containing)}
            checked={props.selectedOption === SearchMode.Containing}
          />
          <label
            htmlFor="radio--containing"
            className="searchradio__radio-label"
          >
            sentences containing word
          </label>
        </div>
        <div className="searchradio__group">
          <input
            type="radio"
            id="radio--beforeandafter"
            className="searchradio__radio"
            name="type"
            value="BeforeAndAfter"
            onChange={() => props.onChange(SearchMode.BeforeAndAfter)}
            checked={props.selectedOption === SearchMode.BeforeAndAfter}
          />
          <label
            htmlFor="radio--beforeandafter"
            className="searchradio__radio-label"
          >
            sentences before and after word
          </label>
        </div>
      </div>
    </div>
  );
};

export default SearchRadioButtons;
