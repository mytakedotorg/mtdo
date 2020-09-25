import * as React from "react";
import * as renderer from "react-test-renderer";
import HowToUseThis from "./HowToUseThis";

jest.mock("./HomeSection", () => ({
  __esModule: true,
  default: "HomeSection",
}));

test("HowToUseThis", () => {
  const tree = renderer.create(<HowToUseThis />).toJSON();
  expect(tree).toMatchSnapshot();
});
