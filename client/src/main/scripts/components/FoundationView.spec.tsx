import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import FoundationView from "./FoundationView";

jest.mock("./TimelineView", () => ({
  default: "TimelineView"
}));

test("With hash URL", () => {
  const hashURL =
    "#bill-of-rights&/samples/does-a-law-mean-what-it-says-or-what-it-meant&294&368&283&439&479.734375";
  const tree = renderer.create(<FoundationView hashUrl={hashURL} />).toJSON();
  expect(tree).toMatchSnapshot();
});

test("Without hash URL", () => {
  const hashURL = "";
  const tree = renderer.create(<FoundationView hashUrl={hashURL} />).toJSON();
  expect(tree).toMatchSnapshot();
});
