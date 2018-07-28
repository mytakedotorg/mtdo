import * as React from "react";
import * as renderer from "react-test-renderer";
import QuickShare from "./QuickShare";
import { videoFactLink } from "../utils/testUtils";

test("It renders", () => {
  const tree = renderer
    .create(
      <QuickShare
        highlightedRange={[0.1, 5]}
        videoIdHash={videoFactLink.hash}
        onSendToTake={jest.fn()}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
