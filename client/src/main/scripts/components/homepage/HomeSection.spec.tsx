import * as React from "react";
import * as renderer from "react-test-renderer";
import HomeSection from "./HomeSection";

test("HomeSection", () => {
  const tree = renderer.create(<HomeSection />).toJSON();
  expect(tree).toMatchSnapshot();
});
