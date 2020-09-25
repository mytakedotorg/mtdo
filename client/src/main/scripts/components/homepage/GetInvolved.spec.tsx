import * as React from "react";
import * as renderer from "react-test-renderer";
import GetInvolved from "./GetInvolved";

jest.mock("./HomeSection", () => ({
  __esModule: true,
  default: "HomeSection",
}));

test("GetInvolved", () => {
  const tree = renderer.create(<GetInvolved />).toJSON();
  expect(tree).toMatchSnapshot();
});
