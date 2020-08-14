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
import React from "react";
import renderer from "react-test-renderer";
import { kennedyNixon } from "../../utils/testUtils";
import { SearchHit } from "./search";
import SearchHitContent from "./SearchHitContent";

interface SearchHitProps {
  searchHit: SearchHit;
}

export const SearchHitMock = (componentName: string) => ({
  searchHit,
  ...rest
}: SearchHitProps): JSX.Element => {
  return (
    <div>
      {componentName}: {JSON.stringify(rest)} {searchHit.videoFact.fact.title}{" "}
      {searchHit.turn} {searchHit.hitOffsets} {searchHit.highlightOffsets}
    </div>
  );
};

test("SearchHitContent renders", () => {
  const searchHit = new SearchHit(
    [[18, 28, "television"]],
    [14, 239],
    0,
    kennedyNixon
  );
  const tree = renderer
    .create(<SearchHitContent searchHit={searchHit} className="testClass" />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
