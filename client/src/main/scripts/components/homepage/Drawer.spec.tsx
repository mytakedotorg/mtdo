import * as React from "react";
import * as renderer from "react-test-renderer";
import Drawer from "./Drawer";

test("Drawer - expanded", () => {
  const props = {
    activeTab: {
      tabTitle: "How to use this",
    },
    isExpanded: true,
  };
  const tree = renderer.create(<Drawer {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});

test("Drawer - collapsed", () => {
  const props = {
    activeTab: {
      tabTitle: "How to use this",
    },
    isExpanded: false,
  };
  const tree = renderer.create(<Drawer {...props} />).toJSON();
  expect(tree).toMatchSnapshot();
});
