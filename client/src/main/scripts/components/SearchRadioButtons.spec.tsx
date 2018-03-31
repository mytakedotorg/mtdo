import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import SearchRadioButtons from "./SearchRadioButtons";

test("SearchRadioButtons Containing", () => {
  const tree = renderer
    .create(
      <SearchRadioButtons onChange={jest.fn()} selectedOption="Containing" />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("SearchRadioButtons BeforeAndAfter", () => {
  const tree = renderer
    .create(
      <SearchRadioButtons
        onChange={jest.fn()}
        selectedOption="BeforeAndAfter"
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
