import * as React from "react";
import * as renderer from "react-test-renderer";
import Tabs from "./Tabs";

test("Tabs - expanded", () => {
  const props = {
    activeTab: {
      tabTitle: "How to use this",
    },
    onTabClick: jest.fn(),
    className: "testclass",
  };
  const tree = renderer.create(<Tabs {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});
