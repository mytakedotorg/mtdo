/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import { mount, ReactWrapper } from "enzyme";
import * as React from "react";
import { documentFactLink, documentNodes } from "../../utils/testUtils";
import TimelinePreview from "./TimelinePreview";

const onDocumentSetClick = jest.fn();
const onVideoSetClick = jest.fn();
const onRangeSet = jest.fn();
const onRangeCleared = jest.fn();

describe("Foundation Document", () => {
  let wrapper: ReactWrapper;
  const offset = 399;
  const highlightedRange: [number, number] = [327, 500];
  const viewRange: [number, number] = [327, 500];

  const setFactHandlers = {
    handleDocumentSetClick: onDocumentSetClick,
    handleVideoSetClick: onVideoSetClick,
    handleRangeSet: onRangeSet,
    handleRangeCleared: onRangeCleared,
  };
  const ranges = {
    highlightedRange: highlightedRange,
    viewRange: viewRange,
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
    expect(wrapper.find(".document__heading").first().text()).toBe(
      "Amendment 13"
    );
  });

  test("Header buttons render", () => {
    // Header button is sibling along with h2.document__heading

    // On initial render, there is 1 button
    expect(wrapper.find(".document__header-actions").children().length).toBe(1);

    // When the button, "Clear Selection" is clicked, it is hidden and a paragraph is shown instead
    wrapper.find(".document__header-actions").childAt(0).simulate("click");
    expect(wrapper.find(".document__header-actions").children().length).toBe(1);

    // When some more text is highlighted, the "Clear Selection" button is shown again
    wrapper.setState({ textIsHighlighted: true });
    expect(wrapper.find(".document__header-actions").children().length).toBe(1);
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
