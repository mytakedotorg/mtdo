import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import SearchBar from "./SearchBar";

jest.mock("./DropDown", () => ({
  default: "DropDown"
}));

test("SearchBar", () => {
  const tree = renderer
    .create(<SearchBar searchTerm={"search term"} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
