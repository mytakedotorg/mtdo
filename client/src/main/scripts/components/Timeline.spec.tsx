import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import Timeline from "./Timeline";

const timelineItems = [
  {
    id: "c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg=",
    idx: "c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg=",
    start: new Date("1788-06-21T00:00:00.000Z"),
    content: "United States Constitution",
    kind: "document"
  },
  {
    id: "pMHhbW_I-wquOfoyPFAVQu8DMLMpYVxhGT8R1x71hYA=",
    idx: "pMHhbW_I-wquOfoyPFAVQu8DMLMpYVxhGT8R1x71hYA=",
    start: new Date("1791-12-15T00:00:00.000Z"),
    content: "Bill of Rights",
    kind: "document"
  },
  {
    id: "-7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM=",
    idx: "-7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM=",
    start: new Date("1960-09-26T00:00:00.000Z"),
    content: "John F. Kennedy - Nixon (1/4)",
    kind: "video"
  },
  {
    id: "bl03RovlxbTZK0yu25_VikP0Y2xSj-J9oFyGUTWIOZQ=",
    idx: "bl03RovlxbTZK0yu25_VikP0Y2xSj-J9oFyGUTWIOZQ=",
    start: new Date("1960-10-07T00:00:00.000Z"),
    content: "John F. Kennedy - Nixon (2/4)",
    kind: "video"
  }
];

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
