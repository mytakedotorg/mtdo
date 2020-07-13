/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
import * as renderer from "react-test-renderer";
import CaptionTextNodeListContainer from "./CaptionTextNodeListContainer";
import { TimeRange, TRACKSTYLES__RANGE } from "./Video";
import { videoFactFast, videoNodes } from "../utils/testUtils";

const onMouseUp = jest.fn();
const onScroll = jest.fn();

const eventHandlers = {
  onMouseUp: onMouseUp,
  onScroll: onScroll,
};

const view: TimeRange = {
  start: 0,
  end: 25,
  type: "VIEW",
  styles: TRACKSTYLES__RANGE,
  label: "Zoom",
};

jest.mock("./CaptionTextNodeList", () => ({
  default: "CaptionTextNode",
}));

test("CaptionTextNodeListContainer", () => {
  const tree = renderer
    .create(
      <CaptionTextNodeListContainer
        captionTimer={0}
        documentNodes={videoNodes}
        eventHandlers={eventHandlers}
        stateAuthority={"SCROLL"}
        videoFact={videoFactFast}
        view={view}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
