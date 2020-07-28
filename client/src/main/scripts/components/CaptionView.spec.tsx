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
import * as renderer from "react-test-renderer";
import CaptionView, { CaptionViewEventHandlers } from "./CaptionView";
import { TimeRange, TRACKSTYLES__RANGE } from "./Video";
import { videoFactLink, videoFactFast } from "../utils/testUtils";

jest.mock("./Document", () => ({
  __esModule: true,
  default: "Document",
}));

jest.mock("./ClipEditor", () => ({
  __esModule: true,
  default: "ClipEditor",
}));

const eventHandlers: CaptionViewEventHandlers = {
  onAfterRangeChange: jest.fn(),
  onClearPress: jest.fn(),
  onHighlight: jest.fn(),
  onPlayPausePress: jest.fn(),
  onRangeChange: jest.fn(),
  onRestartPress: jest.fn(),
  onScroll: jest.fn(),
  onSendToTake: jest.fn(),
  onSkipBackPress: jest.fn(),
  onSkipForwardPress: jest.fn(),
  onZoomToClipPress: jest.fn(),
};

test("CaptionTextNodeList", () => {
  const viewRange: TimeRange = {
    start: 0,
    end: 25,
    type: "VIEW",
    styles: TRACKSTYLES__RANGE,
    label: "Zoom",
  };
  const selectionRange: TimeRange = {
    start: 0,
    end: 0,
    type: "SELECTION",
    styles: TRACKSTYLES__RANGE,
    label: "Clip",
  };
  const rangeSliders = [viewRange, selectionRange];

  const tree = renderer
    .create(
      <CaptionView
        videoFact={videoFactFast}
        videoFactHash={videoFactLink.hash}
        timer={0}
        captionIsHighlighted={false}
        highlightedCharRange={[-1, -1]}
        eventHandlers={eventHandlers}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={false}
        rangeSliders={rangeSliders}
        stateAuthority={"SCROLL"}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("CaptionTextNodeList with highlights from props", () => {
  const viewRange: TimeRange = {
    start: 3.6,
    end: 8.7,
    type: "VIEW",
    styles: TRACKSTYLES__RANGE,
    label: "Zoom",
  };
  const selectionRange: TimeRange = {
    start: 5.3,
    end: 7.2,
    type: "SELECTION",
    styles: TRACKSTYLES__RANGE,
    label: "Zoom",
  };
  const rangeSliders = [viewRange, selectionRange];

  const tree = renderer
    .create(
      <CaptionView
        videoFact={videoFactFast}
        videoFactHash={videoFactLink.hash}
        timer={5.31}
        captionIsHighlighted={true}
        highlightedCharRange={[80, 128]}
        eventHandlers={eventHandlers}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={true}
        rangeSliders={rangeSliders}
        stateAuthority={"SCROLL"}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

// Add an action test case for when a user highlights caption text
