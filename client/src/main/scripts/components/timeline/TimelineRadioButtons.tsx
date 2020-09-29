/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import { Corpus } from "../../common/social/social";
import { ExternalLink } from "react-feather";

interface TimelineRadioButtonsProps {
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => any;
  selectedOption: Corpus;
}

const TimelineRadioButtons: React.StatelessComponent<TimelineRadioButtonsProps> = (
  props
) => {
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
          checked={props.selectedOption === Corpus.Debates}
        />
        <label htmlFor="radio--debates" className="timeline__radio-label">
          U.S. Presidential Debates
          <a
            href="https://github.com/mytakedotorg/us-presidential-debates"
            className="timeline__radio-link-icon"
          >
            <ExternalLink size={18} />
          </a>
        </label>
        {/*
        <input
          type="radio"
          id="radio--documents"
          className="timeline__radio"
          name="type"
          value="Documents"
          onChange={props.onChange}
          checked={props.selectedOption === Corpus.Documents}
        />
        */}
        &nbsp;
        <label htmlFor="radio--documents" className="timeline__radio-label">
          <a href="https://github.com/mytakedotorg/mtdo">More to come...</a>
        </label>
      </div>
    </div>
  );
};

export default TimelineRadioButtons;
