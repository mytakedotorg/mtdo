import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import DocumentTextNodeList from "./DocumentTextNodeList";

const documentNodes = [
  {
    component: "p",
    innerHTML: [
      "Section 1. Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States, or any place subject to their jurisdiction."
    ],
    offset: 0
  },
  {
    component: "p",
    innerHTML: [
      "Section 2. Congress shall have power to enforce this article by appropriate legislation."
    ],
    offset: 218
  }
];

const onMouseUp = jest.fn();
const className = "document__text";

jest.mock("./DocumentTextNode", () => ({
  default: "DocumentTextNode"
}));

test("DocumentTextNodeList", () => {
  const tree = renderer
    .create(
      <DocumentTextNodeList
        documentNodes={documentNodes}
        onMouseUp={onMouseUp}
        className={className}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
