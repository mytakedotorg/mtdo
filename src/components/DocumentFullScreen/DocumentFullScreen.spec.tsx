import * as React from "react";
import { mount, ReactWrapper } from "enzyme";

import DocumentFullScreen from "./DocumentFullScreen";

const onBackClick = jest.fn();
const onSetClick = jest.fn();

interface MockWindow extends Window {
  scrollTo: jest.Mock<{}> & typeof window.scrollTo;
}

function getMockWindow() {
  window.scrollTo = jest.fn();
  return window as MockWindow;
}

let mockWindow = getMockWindow();

describe("Constitution", () => {
  let wrapper: ReactWrapper;
  const offset = 399;
  const highlightedRange: [number, number] = [19343, 19970];
  const excerptId = "united-states-constitution";

  beforeAll(() => {
    wrapper = mount(
      <DocumentFullScreen
        offset={offset}
        onBackClick={onBackClick}
        onSetClick={onSetClick}
        highlightedRange={highlightedRange}
        excerptId={excerptId}
      />
    );
  });

  test("Document renders", () => {
    expect(wrapper.find(DocumentFullScreen).length).toBe(1);
  });

  test("Scrolling header renders", () => {
    expect(wrapper.find(".document__header--visible").length).toBe(1);
    expect(wrapper.find(".document__header--hidden").length).toBe(0);

    wrapper.setState({ headerHidden: true });

    expect(wrapper.find(".document__header--visible").length).toBe(0);
    expect(wrapper.find(".document__header--hidden").length).toBe(1);
  });

  test("Fixed header renders", () => {
    expect(wrapper.find(".document__header--fixed").length).toBe(1);
  });

  test("Heading text renders properly", () => {
    expect(wrapper.find(".document__heading").first().text()).toBe(
      "United States Constitution"
    );
  });

  test("Header buttons render", () => {
    // Header buttons are siblings along with h2.document__heading
    expect(
      wrapper.find(".document__header").first().childAt(0).children().length
    ).toBe(2);

    wrapper.setState({ textIsHighlighted: true });

    expect(
      wrapper.find(".document__header").first().childAt(0).children().length
    ).toBe(3);
  });

  test("Back button works", () => {
    wrapper
      .find(".document__header")
      .children()
      .at(0)
      .children()
      .at(1)
      .simulate("click");
    expect(onBackClick).toHaveBeenCalled();
  });

  test("Clear button works", () => {
    wrapper.setState({ textIsHighlighted: true });
    wrapper
      .find(".document__header")
      .children()
      .at(0)
      .children()
      .at(2)
      .simulate("click");
    expect(wrapper.state("textIsHighlighted")).toBe(false);
  });

  test("Set text click works for initial highlight", () => {
    wrapper.find(".editor__block--overlay").simulate("click");
    expect(onSetClick).toHaveBeenCalled();
  });

  test("Constitution text renders", () => {
    expect(wrapper.find(".document__text").children().length).toBe(168);
  });

  test("Initial highlights render", () => {
    expect(wrapper.find(".editor__block--overlay").length).toBe(1);
  });

  test("Window autoscrolls", () => {
    // expect(mockWindow.scrollTo).toHaveBeenCalledWith(0, 6967);
    // in Document.tsx, getStartRangeOffsetTop should return 7167,
    // but this returns 0 while testing.
    // Can't figure out how to mock out that function.
    // Good info here, but it's not enough https://stackoverflow.com/questions/39633919/cannot-mock-a-module-with-jest-and-test-function-calls?rq=1

    expect(mockWindow.scrollTo).toHaveBeenCalled();
  });

  /**
	 * TODO: 
	 *   - Add the following test cases:
	 *     + Some text is highlighted by user
	 * 	   + Set text click works for user highlights
	 *   - Fix test cases:
	 *     + Window autoscrolls (See comments inside test block)
	 */
});
