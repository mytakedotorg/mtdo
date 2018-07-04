import * as React from "react";
import * as renderer from "react-test-renderer";
import ShareClip from "./ShareClip";
import { videoFactLink } from "../utils/testUtils";

test("It renders", () => {
  const tree = renderer
    .create(
      <ShareClip
        factSlug={"presidential-debate-clinton-trump-2-of-3"}
        highlightedRange={[0.1, 5]}
        videoIdHash={videoFactLink.hash}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
