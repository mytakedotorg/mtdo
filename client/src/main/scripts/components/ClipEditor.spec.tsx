/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018 MyTake.org, Inc.
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
import ClipEditor, { ClipEditorEventHandlers } from "./ClipEditor";
import {
  initialRangeSliders,
  unzoomedRangeSliders,
  zoomedRangeSliders,
  videoFactLink,
} from "../utils/testUtils";

jest.mock("./ZoomViewer");

jest.mock("./TrackSlider");

jest.mock("./QuickShare");

const eventHandlers: ClipEditorEventHandlers = {
  onAfterRangeChange: jest.fn(),
  onClearPress: jest.fn(),
  onPlayPausePress: jest.fn(),
  onRangeChange: jest.fn(),
  onRestartPress: jest.fn(),
  onSendToTake: jest.fn(),
  onSkipBackPress: jest.fn(),
  onSkipForwardPress: jest.fn(),
  onZoomToClipPress: jest.fn(),
};

test("Initial ClipEditor", () => {
  const tree = renderer
    .create(
      <ClipEditor
        eventHandlers={eventHandlers}
        captionIsHighlighted={false}
        currentTime={0}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={false}
        rangeSliders={initialRangeSliders}
        stateAuthority={"SCROLL"}
        videoIdHash={videoFactLink.hash}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("ClipEditor with zoomed selection", () => {
  const tree = renderer
    .create(
      <ClipEditor
        eventHandlers={eventHandlers}
        captionIsHighlighted={true}
        currentTime={3.87}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={true}
        rangeSliders={zoomedRangeSliders}
        stateAuthority={"SCROLL"}
        videoIdHash={videoFactLink.hash}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("ClipEditor with zoomed selection", () => {
  const tree = renderer
    .create(
      <ClipEditor
        eventHandlers={eventHandlers}
        captionIsHighlighted={true}
        currentTime={3.87}
        videoDuration={5224}
        isPaused={true}
        isZoomedToClip={false}
        rangeSliders={unzoomedRangeSliders}
        stateAuthority={"SCROLL"}
        videoIdHash={videoFactLink.hash}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
