import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import CaptionTextNode from "./CaptionTextNode";

const documentNode = {
  component: "p",
  offset: 0,
  innerHTML: ["Good evening I'm Martha Raddatz from ABC News."]
};

const speaker = "Raddatz";

test("CaptionTextNode", () => {
  const tree = renderer
    .create(<CaptionTextNode documentNode={documentNode} speaker={speaker} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
