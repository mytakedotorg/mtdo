import * as React from "react";
import * as renderer from "react-test-renderer";
import AnonymousTake from "./AnonymousTake";
import { anonymousPath } from "../utils/testUtils";

jest.mock("./BlockEditor", () => ({
  default: "BlockEditor"
}));

test("It renders", () => {
  const tree = renderer.create(<AnonymousTake path={anonymousPath} />).toJSON();
  expect(tree).toMatchSnapshot();
});
