import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import MyTake, { MyTakeState } from "./MyTake";

const onBackClick = jest.fn();
const onSetClick = jest.fn();

let wrapper: ReactWrapper;

beforeAll(() => {
  let initState: MyTakeState = {
    takeDocument: {
      title: "",
      blocks: [{ kind: "paragraph", text: "" }]
    },
    activeBlockIndex: -1
  };

  wrapper = mount(<MyTake initState={initState} />);
});

test("MyTake renders", () => {
  expect(wrapper.find(MyTake).length).toBe(1);
});

/**
 * TODO: 
 *   - Add the following test cases:
 *     + 'When Document is clicked in FoundationExplorer, addDocument isCalledWith(type, range)'
 *     + 'When addDocument is called, state is updated'
 *     + 'When enter key is pressed, addParagraph isCalled)'
 *     + 'When addParagraph is called, state is updated'
 *     + 'When Video set button is clicked, addVideo isCalledWIth(id, range)'
 *     + 'When addVideo is called, state is updated'
 *     + 'removeParagraph is calledWith(idx) when '
 *       - Paragraph is empty and loses focus
 *       - Paragraph is empty and backspace or delete is pressed
 *     + 'When removeParagraph is called, state is updated'
 *     + 'When text key is pressed, handleTakeBlockChange is calledWidth(idx, value)'
 *     + 'When handleTakeBlockChange is called, state is updated'
 *     + 'When block gains focus, handleTakeBlockFocus is calledWith(idx)'
 *     + 'When handleTakeBlockFocus is called, state('activeBlockIndex') is updated
 */
