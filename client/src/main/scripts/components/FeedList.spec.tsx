import * as React from "react";
import * as renderer from "react-test-renderer";
import FeedList from "./FeedList";
import { cards } from "../utils/testUtils";

jest.mock("./FeedCardContainer", () => ({
  default: "FeedCardContainer"
}));

test("FeedList", () => {
  const tree = renderer.create(<FeedList cards={cards} />).toJSON();
  expect(tree).toMatchSnapshot();
});
