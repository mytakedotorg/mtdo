import * as React from "react";
import { mount, ReactWrapper } from "enzyme";
import FoundationExplorer from "./FoundationExplorer";
import { FoundationTextType } from "../Foundation";

const onBackClick = jest.fn();
const onSetClick = jest.fn();

let wrapper: ReactWrapper;

beforeAll(() => {
  let title = "does-a-law-mean-what-it-says-or-what-it-meant";
  let user = "samples";
  let range: [number, number] = [30794, 30939];
  let scrollTop = 101;
  let type: FoundationTextType = "CONSTITUTION";
  wrapper = mount(
    <FoundationExplorer
      articleTitle={title}
      articleUser={user}
      range={range}
      scrollTop={scrollTop}
      type={type}
    />
  );
});

test("FoundationExplorer renders", () => {
  expect(wrapper.find(FoundationExplorer).length).toBe(1);
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
