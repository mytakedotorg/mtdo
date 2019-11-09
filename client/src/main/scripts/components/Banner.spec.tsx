import * as React from "react";
import * as renderer from "react-test-renderer";
import Banner from "./Banner";

test("Success Banner", () => {
  const tree = renderer
    .create(<Banner isSuccess={true}>Banner message</Banner>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Error Banner", () => {
  const tree = renderer
    .create(<Banner isSuccess={false}>Banner message</Banner>)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
