/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017 MyTake.org, Inc.
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
import { SelectionOptions } from "./TimelineView";

interface TimelineRadioButtonsProps {
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => any;
  selectedOption: SelectionOptions;
}

const TimelineRadioButtons: React.StatelessComponent<
  TimelineRadioButtonsProps
> = props => {
  return (
    <div className="timeline__inner-container">
      <div className="timeline__actions">
        <input
          type="radio"
          id="radio--debates"
          className="timeline__radio"
          name="type"
          value="Debates"
          onChange={props.onChange}
          checked={props.selectedOption === "Debates"}
        />
        <label htmlFor="radio--debates" className="timeline__radio-label">
          Debates
        </label>
        <input
          type="radio"
          id="radio--documents"
          className="timeline__radio"
          name="type"
          value="Documents"
          onChange={props.onChange}
          checked={props.selectedOption === "Documents"}
        />
        <label htmlFor="radio--documents" className="timeline__radio-label">
          Founding Documents
        </label>
      </div>
    </div>
  );
};

export default TimelineRadioButtons;
