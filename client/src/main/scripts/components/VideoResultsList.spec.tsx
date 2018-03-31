import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import { VideoResultLoadingView } from "./VideoResultsLoader";
import VideoResultsList from "./VideoResultsList";
import { factResultList } from "../utils/testUtils";

jest.mock("./VideoLite", () => ({
  default: "VideoLite"
}));

jest.mock("./VideoPlaceholder", () => ({
  default: "VideoPlaceholder"
}));

jest.mock("./SearchRadioButtons", () => ({
  default: "SearchRadioButtons"
}));

jest.mock("./VideoFactsLoader", () => ({
  default: "VideoFactsLoader"
}));

test("Loading view while requesting all search results", () => {
  const tree = renderer.create(<VideoResultLoadingView />).toJSON();
  expect(tree).toMatchSnapshot();
});

test("List of video results", () => {
  const tree = renderer
    .create(<VideoResultsList results={factResultList} searchTerm="richard" />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("No results", () => {
  const tree = renderer
    .create(<VideoResultsList results={{ facts: [] }} searchTerm="richard" />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
