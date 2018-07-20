import * as React from "react";
import * as renderer from "react-test-renderer";
import ShareClip from "./ShareClip";
import { videoFactLink } from "../utils/testUtils";

test("It renders", () => {
  const tree = renderer
    .create(
      <ShareClip highlightedRange={[0.1, 5]} videoIdHash={videoFactLink.hash} />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
