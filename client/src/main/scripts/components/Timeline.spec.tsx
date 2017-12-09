import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import Timeline from "./Timeline";
import { timelineItems } from "../utils/testUtils";

// These tests do not work as expected. Vis.Timeline is a Portal component.
// The timelineItems are "rendered" outside of the root React component in the
// virtual DOM. These snapshots just show empty divs. Not sure how to test this.
// https://github.com/airbnb/enzyme/issues/252 might be a start.

test("Debates Timeline", () => {
  const tree = renderer
    .create(
      <Timeline
        timelineItems={timelineItems}
        onItemClick={jest.fn()}
        selectedOption={"Debates"}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Documents Timeline", () => {
  const tree = renderer
    .create(
      <Timeline
        timelineItems={timelineItems}
        onItemClick={jest.fn()}
        selectedOption={"Documents"}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
