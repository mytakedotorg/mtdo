import * as React from "react";
import * as renderer from "react-test-renderer";
import TimelineRadioButtons from "./TimelineRadioButtons";

const mockFn = jest.fn();

test("Debates selected", () => {
  const tree = renderer
    .create(
      <TimelineRadioButtons onChange={mockFn} selectedOption={"Debates"} />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Documents selected", () => {
  const tree = renderer
    .create(
      <TimelineRadioButtons onChange={mockFn} selectedOption={"Documents"} />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
