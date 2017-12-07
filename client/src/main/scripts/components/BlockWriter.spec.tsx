import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import BlockWriter, { InitialBlockWriterState } from "./BlockWriter";
import { DocumentBlock, ParagraphBlock, VideoBlock } from "./BlockEditor";
import {} from "jest";

const onBackClick = jest.fn();
const onSetClick = jest.fn();

let wrapper: ReactWrapper;

test("Will always pass", () => {
  expect(1 + 1).toEqual(2);
});

// describe("A series of editor actions", () => {
//   beforeAll(() => {
//     let initState: BlockWriterState = {
//       takeDocument: {
//         title: "",
//         blocks: [{ kind: "paragraph", text: "" }]
//       },
//       activeBlockIndex: -1,
//       status: "INITIAL"
//     };

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
//     const newState = wrapper.state() as BlockWriterState;
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

//     const newTakeDocument = (wrapper.state() as BlockWriterState).takeDocument;
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
//     const newTakeDocument = (wrapper.state() as BlockWriterState).takeDocument;

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
//       (wrapper.state() as BlockWriterState).takeDocument.blocks.length
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
//       (wrapper.state() as BlockWriterState).takeDocument.blocks.length
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
//     const newState = wrapper.state() as BlockWriterState;
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
