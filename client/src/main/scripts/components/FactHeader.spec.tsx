import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import { StickyFactHeader } from "./FactHeader";

const documentProps = {
  heading: "Bill of Rights",
  isDocument: true,
  onClearClick: jest.fn(),
  onSetClick: jest.fn(),
  onScroll: jest.fn()
};

test("Fixed with text highlighted", () => {
  const tree = renderer
    .create(
      <StickyFactHeader
        {...documentProps}
        isFixed={true}
        textIsHighlighted={true}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Fixed without text highlighted", () => {
  const tree = renderer
    .create(
      <StickyFactHeader
        {...documentProps}
        isFixed={true}
        textIsHighlighted={false}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Scrolling with text highlighted", () => {
  const tree = renderer
    .create(
      <StickyFactHeader
        {...documentProps}
        isFixed={false}
        textIsHighlighted={true}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Scrolling without text highlighted", () => {
  const tree = renderer
    .create(
      <StickyFactHeader
        {...documentProps}
        isFixed={false}
        textIsHighlighted={false}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
