import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import Fact from "./Fact";

const onBackClick = jest.fn();
const onSetClick = jest.fn();

let wrapper: ReactWrapper;

beforeAll(() => {
  let title = "does-a-law-mean-what-it-says-or-what-it-meant";
  let user = "samples";
  let range: [number, number] = [368, 513];
  let scrollTop = 101;
  let excerptId = "bill-of-rights";
  wrapper = mount(
    <Fact
      articleTitle={title}
      articleUser={user}
      highlightedRange={range}
      scrollTop={scrollTop}
      excerptId={excerptId}
    />
  );
});

test("FoundationExplorer renders", () => {
  expect(wrapper.find(Fact).length).toBe(1);
});

// test("Set button works", () => {
// 	wrapper.find('.editor__block--overlay').simulate('click');
// 	expect(onSetClick).toHaveBeenCalled();
// 	//Then highlight additional text and simulate click on '.document__text--selected'
// });

/**
 * TODO: 
 *   - Add the following test cases:
 *     + 'Back button works'
 *   - Fix test cases:
 *     + 'Set button works' called window.location.href. Need to mock this out.
 */
