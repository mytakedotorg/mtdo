import * as React from "react";
import * as renderer from "react-test-renderer";
import FoundationView from "./FoundationView";

jest.mock("./TimelineView", () => ({
  default: "TimelineView"
}));

test("With fact in URL", () => {
  const path = "/foundation/bill-of-rights";
  const tree = renderer
    .create(<FoundationView path={path} search={""} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Without fact in URL", () => {
  const path = "/foundation";
  const hashURL = "";
  const tree = renderer
    .create(<FoundationView path={path} search={""} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
