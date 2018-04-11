import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import DropDown from "./DropDown";

const Toggle = <span>toggle text</span>;
const Children = (
  <div>
    <p>Some child</p>
  </div>
);

test("DropDown BL", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="BL"
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown disabled", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="BL"
        disabled={true}
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown enabled", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="BL"
        disabled={false}
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown BR", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="BR"
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown TL", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="TL"
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("DropDown TR", () => {
  const tree = renderer
    .create(
      <DropDown
        children={Children}
        classModifier={"searchbar"}
        dropdownPosition="TR"
        toggleText={Toggle}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
