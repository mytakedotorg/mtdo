import * as React from "react";
import * as renderer from "react-test-renderer";
import DocumentTextNodeList from "./DocumentTextNodeList";
import { documentNodes } from "../utils/testUtils";

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
