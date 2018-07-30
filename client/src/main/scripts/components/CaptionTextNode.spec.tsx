import * as React from "react";
import * as renderer from "react-test-renderer";
import CaptionTextNode from "./CaptionTextNode";

const captionNode = "Good evening I'm Martha Raddatz from ABC News.";

const speaker = "Raddatz";

test("CaptionTextNode", () => {
  const tree = renderer
    .create(<CaptionTextNode documentNode={captionNode} speaker={speaker} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
