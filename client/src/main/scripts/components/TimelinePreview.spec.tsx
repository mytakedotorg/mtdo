import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import TimelinePreview from "./TimelinePreview";
import { documentFactLink, documentNodes } from "../utils/testUtils";

const onDocumentSetClick = jest.fn();
const onVideoSetClick = jest.fn();
const onRangeSet = jest.fn();
const onRangeCleared = jest.fn();

interface MockWindow extends Window {
  scrollTo: jest.Mock<{}> & typeof window.scrollTo;
}

function getMockWindow() {
  window.scrollTo = jest.fn();
  return window as MockWindow;
}

let mockWindow = getMockWindow();

describe("Foundation Document", () => {
  let wrapper: ReactWrapper;
  const offset = 399;
  const highlightedRange: [number, number] = [327, 500];
  const viewRange: [number, number] = [327, 500];

  const setFactHandlers = {
    handleDocumentSetClick: onDocumentSetClick,
    handleVideoSetClick: onVideoSetClick,
    handleRangeSet: onRangeSet,
    handleRangeCleared: onRangeCleared
  };
  const ranges = {
    highlightedRange: highlightedRange,
    viewRange: viewRange
  };

  beforeAll(() => {
    wrapper = mount(
      <TimelinePreview
        factLink={documentFactLink}
        nodes={documentNodes}
        setFactHandlers={setFactHandlers}
        ranges={ranges}
        offset={offset}
      />
    );
  });

  test("Document renders", () => {
    expect(wrapper.find(TimelinePreview).length).toBe(1);
  });

  test("Heading text renders properly", () => {
    expect(
      wrapper
        .find(".document__heading")
        .first()
        .text()
    ).toBe("Amendment 13");
  });

  test("Header buttons render", () => {
    // Header button is sibling along with h2.document__heading

    // On initial render, there is 1 button
    expect(wrapper.find(".document__header-actions").children().length).toBe(2);

    // When the button, "Clear Selection" is clicked, it is hidden and a paragraph is shown instead
    wrapper
      .find(".document__header-actions")
      .childAt(0)
      .simulate("click");
    expect(wrapper.find(".document__header-actions").children().length).toBe(1);

    // When some more text is highlighted, the "Clear Selection" button is shown again
    wrapper.setState({ textIsHighlighted: true });
    expect(wrapper.find(".document__header-actions").children().length).toBe(2);
  });

  test("Set text click works for initial highlight", () => {
    wrapper.find(".editor__block--overlay").simulate("click");
    expect(onDocumentSetClick).toHaveBeenCalled();
  });

  test("Amendment text renders", () => {
    expect(wrapper.find(".document__text").length).toBe(2);
  });

  test("Initial highlights render", () => {
    expect(wrapper.find(".editor__block--overlay").length).toBe(1);
  });

  test("Clear button works", () => {
    wrapper.setState({ textIsHighlighted: true });
    wrapper
      .find(".document__header-actions")
      .children()
      .at(0)
      .simulate("click");
    expect(wrapper.state("textIsHighlighted")).toBe(false);
  });

  // test("Window autoscrolls", () => {
  //   // expect(mockWindow.scrollTo).toHaveBeenCalledWith(0, 6967);
  //   // in Document.tsx, getStartRangeOffsetTop should return 7167,
  //   // but this returns 0 while testing.
  //   // Can't figure out how to mock out that function.
  //   // Good info here, but it's not enough https://stackoverflow.com/questions/39633919/cannot-mock-a-module-with-jest-and-test-function-calls?rq=1

  //   expect(mockWindow.scrollTo).toHaveBeenCalled();
  // });

  /**
   * TODO:
   *   - Add the following test cases:
   *     + Some text is highlighted by user
   * 	   + Set text click works for user highlights
   *   - Fix test cases:
   *     + Window autoscrolls (See comments inside test block)
   */
});
