import * as React from "react";
import * as renderer from "react-test-renderer";
import DocumentTextNode from "./DocumentTextNode";
import { documentNodes } from "../utils/testUtils";

const documentNode = documentNodes[0];

test("DocumentTextNode", () => {
  const tree = renderer
    .create(<DocumentTextNode documentNode={documentNode} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
