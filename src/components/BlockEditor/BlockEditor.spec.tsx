// https://facebook.github.io/jest/docs/snapshot-testing.html#content

import * as React from "react";
import * as renderer from "react-test-renderer";
import BlockEditor from "./BlockEditor";
import { TakeDocument } from "./BlockEditor";

const doc: TakeDocument = {
  title: "My take title",
  blocks: [
    {
      kind: "paragraph",
      text: "Some text"
    },
    {
      kind: "document",
      document: "AMENDMENTS",
      range: [369, 514]
    }
  ]
};

const handleChange = (id: number, value: string): void => {};
const handleDelete = (id: number): void => {};
const handleEnter = (): void => {};
const handleFocus = (id: number): void => {};
const handlers = {
  handleChange,
  handleDelete,
  handleEnter,
  handleFocus
};

test("Simple block editor model", () => {
  const tree = renderer
    .create(<BlockEditor takeDocument={doc} active={-1} {...handlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("With active", () => {
  const tree = renderer
    .create(<BlockEditor takeDocument={doc} active={0} {...handlers} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});

// test('With hover', () => {
//     const tree = renderer.create(
//         <BlockEditor takeDocument={doc} active={-1} {...handlers} />
//     ).toJSON();
//     expect(tree).toMatchSnapshot();
// })

// test('With hover and active', () => {
//     const tree = renderer.create(
//         <BlockEditor takeDocument={doc} active={-1} {...handlers} />
//     ).toJSON();
//     expect(tree).toMatchSnapshot();
// })
