import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import DocumentTextNode from "./DocumentTextNode";

const documentNode = {
  component: "p",
  innerHTML: [
    "Section 1. Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States, or any place subject to their jurisdiction."
  ],
  offset: 0
};

test("DocumentTextNode", () => {
  const tree = renderer
    .create(<DocumentTextNode documentNode={documentNode} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
