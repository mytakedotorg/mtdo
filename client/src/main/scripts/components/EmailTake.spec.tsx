import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import EmailTake from "./EmailTake";
import { takeDocument } from "../utils/testUtils";

test("EmailTake", () => {
  const tree = renderer
    .create(<EmailTake takeDocument={takeDocument} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
