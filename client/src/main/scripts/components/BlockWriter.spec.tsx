/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
import * as React from "react";
import * as renderer from "react-test-renderer";
import BlockWriter, { InitialBlockWriterState } from "./BlockWriter";

jest.mock("./BlockEditor");

jest.mock("./TimelineView");

jest.mock("./EditorButtons", () => {
  return {
    __esModule: true,
    default: "EditorButtons",
  };
});

jest.mock("./DropDown");

jest.mock("./EmailTake");

// Object.defineProperty(window.location, "pathname", {
//   writable: true,
//   value: "/drafts/new"
// });

const initState: InitialBlockWriterState = {
  takeDocument: {
    title: "",
    blocks: [{ kind: "paragraph", text: "" }],
  },
  activeBlockIndex: -1,
};

test("Simple block writer model", () => {
  const tree = renderer.create(<BlockWriter initState={initState} />).toJSON();
  expect(tree).toMatchSnapshot();
});

const biggerInitState: InitialBlockWriterState = {
  takeDocument: {
    title: "00new take",
    blocks: [
      {
        kind: "paragraph",
        text: "Some text.",
      },
      {
        kind: "document",
        excerptId: "o_dRqrNJ62wzlgLilTrLxkHqGmvAS9qTpa4z4pjyFqA=",
        viewRange: [0, 218],
        highlightedRange: [31, 42],
      },
      {
        kind: "paragraph",
        text: "",
      },
    ],
  },
  activeBlockIndex: 1,
  parentRev: {
    draftid: 11,
    lastrevid: 11,
  },
};

test("Bigger block writer model", () => {
  const tree = renderer
    .create(<BlockWriter initState={biggerInitState} />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
// let wrapper: ReactWrapper;

// describe("A series of editor actions", () => {

//   beforeAll(() => {
// let initState: InitialBlockWriterState = {
//   takeDocument: {
//     title: "",
//     blocks: [{ kind: "paragraph", text: "" }]
//   },
//   activeBlockIndex: -1
// };

//     wrapper = mount(<BlockWriter initState={initState} />);
//   });

//   test("BlockWriter renders", () => {
//     expect(wrapper.find(BlockWriter).length).toBe(1);
//   });

//   test("Add a Document block", () => {
//     (wrapper.instance() as BlockWriter).addDocument(
//       "bill-of-rights",
//       [294, 368],
//       [294, 439]
//     );
//     const newState = wrapper.state() as InitialBlockWriterState;
//     const docBlock = newState.takeDocument.blocks[0] as DocumentBlock;
//     expect(docBlock.kind).toBe("document");
//     expect(docBlock.excerptId).toBe("bill-of-rights");
//     expect(docBlock.highlightedRange).toEqual(
//       expect.arrayContaining([294, 368])
//     );
//     expect(docBlock.viewRange).toEqual(expect.arrayContaining([294, 439]));
//   });

//   test("Type in a Paragraph block", () => {
//     // /****** CURRENT BLOCK LIST ******/
//     // [
//     //   {
//     //     kind: "document",
//     //     excerptId: "bill-of-rights",
//     //     highlightedRange: [368, 513],
//     //     viewRange: [0, 0]
//     //   },
//     //   { kind: "paragraph", text: "" }
//     // ];

//     // Simulate typing the word "test" into the new paragraph block
//     wrapper
//       .find(".editor__block-list")
//       .children()
//       .at(1)
//       .find(".editor__paragraph")
//       .simulate("change", { target: { value: "test" } });

//     const newTakeDocument = (wrapper.state() as InitialBlockWriterState).takeDocument;
//     const paragraphBlock = newTakeDocument.blocks[1] as ParagraphBlock;
//     expect(paragraphBlock.kind).toBe("paragraph");
//     expect(paragraphBlock.text).toBe("test");
//   });

//   test("Add a Paragraph block", () => {
//     // /****** CURRENT BLOCK LIST ******/
//     // [
//     //   {
//     //     kind: "document",
//     //     excerptId: "bill-of-rights",
//     //     highlightedRange: [368, 513],
//     //     viewRange: [0, 0]
//     //   },
//     //   { kind: "paragraph", text: "test" }
//     // ];

//     // Simulate an enter press on the paragraph
//     wrapper
//       .find(".editor__block-list")
//       .children()
//       .at(1)
//       .find(".editor__paragraph")
//       .simulate("keyDown", { keyCode: 13 });
//     const newTakeDocument = (wrapper.state() as InitialBlockWriterState).takeDocument;

//     const newBlock = newTakeDocument.blocks[2] as ParagraphBlock;
//     expect(newBlock.kind).toBe("paragraph");
//     expect(newBlock.text).toBe("");
//   });

//   test("Remove an empty Paragraph block", () => {
//     // /****** CURRENT BLOCK LIST ******/
//     // [
//     //   {
//     //     kind: "document",
//     //     excerptId: "bill-of-rights",
//     //     highlightedRange: [368, 513],
//     //     viewRange: [0, 0]
//     //   },
//     //   { kind: "paragraph", text: "test" },
//     //   { kind: "paragraph", text: "" }
//     // ];

//     expect(
//       (wrapper.state() as InitialBlockWriterState).takeDocument.blocks.length
//     ).toBe(3);

//     // When the last empty paragraph block loses focus...
//     wrapper
//       .find(".editor__block-list")
//       .children()
//       .at(2)
//       .find(".editor__paragraph")
//       .simulate("blur");

//     // Expect it to be removed from the state
//     expect(
//       (wrapper.state() as InitialBlockWriterState).takeDocument.blocks.length
//     ).toBe(2);
//   });

//   test("Add a Video block", () => {
//     // /****** CURRENT BLOCK LIST ******/
//     // [
//     //   {
//     //     kind: "document",
//     //     excerptId: "bill-of-rights",
//     //     highlightedRange: [368, 513],
//     //     viewRange: [0, 0]
//     //   },
//     //   { kind: "paragraph", text: "test" }
//     // ];
//     const videoId = "ApTLB76Nmdg";
//     (wrapper.instance() as BlockWriter).addVideo(videoId, [0, 6]);
//     const newState = wrapper.state() as InitialBlockWriterState;
//     const vidBlock = newState.takeDocument.blocks[2] as VideoBlock;
//     expect(vidBlock.kind).toBe("video");
//     expect(vidBlock.videoId).toBe(videoId);
//     expect(vidBlock.range).toEqual(expect.arrayContaining([0, 6]));
//   });

//   test("Focuses", () => {
//     const blockList = wrapper.find(".editor__block-list").children();

//     blockList.at(0).find(".editor__document").simulate("click");

//     expect(wrapper.state("activeBlockIndex")).toBe(0);

//     blockList.at(1).find(".editor__paragraph").simulate("click");

//     expect(wrapper.state("activeBlockIndex")).toBe(1);

//     blockList.at(2).find(".editor__video-container").simulate("click");

//     expect(wrapper.state("activeBlockIndex")).toBe(2);
//   });
// });
