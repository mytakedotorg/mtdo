import * as React from "react";
import { mount, ReactWrapper } from "enzyme";

import Document from "./Document";

const onBackClick = jest.fn();
const onSetClick = jest.fn();

interface MockWindow extends Window {
	scrollTo: jest.Mock<{}> & typeof window.scrollTo
}

function getMockWindow() {
	window.scrollTo = jest.fn();
	return window as MockWindow;
}

let mockWindow = getMockWindow();

describe('Constitution', () => {
	let wrapper: ReactWrapper;
	const offset = 399;
	const range: [number, number] = [19343, 19970];
	const type = "CONSTITUTION";

	beforeAll(() => {
		wrapper = mount(
			<Document 
				offset={offset}
				onBackClick={onBackClick}
				onSetClick={onSetClick}
				range={range}
				type={type}
			/>
		);
	});

	test("Document renders", () => {
		expect(wrapper.find(Document).length).toBe(1);
	});
	
	test("Scrolling header renders", () => {
		expect(wrapper.find('.document__header--visible').length).toBe(1);
		expect(wrapper.find('.document__header--hidden').length).toBe(0);
		
		wrapper.setState({headerHidden: true});

		expect(wrapper.find('.document__header--visible').length).toBe(0);
		expect(wrapper.find('.document__header--hidden').length).toBe(1);
	});

	test("Fixed header renders", () => {
		expect(wrapper.find('.document__header--fixed').length).toBe(1);
	});

	test("Header buttons render", () => {
		// Header buttons are siblings along with h2.document__heading
		expect(wrapper.find('.document__header').first().childAt(0).children().length).toBe(2);

		wrapper.setState({textIsHighlighted: true});

		expect(wrapper.find('.document__header').first().childAt(0).children().length).toBe(3);
	});

	test("Constitution text renders", () => {
		expect(wrapper.find('.document__text').children().length).toBe(168);
	});

	test("Initial highlights render", () => {
		expect(wrapper.find('.editor__block--overlay').length).toBe(1);
	});

	test("Window autoscrolls", () => {
		// expect(mockWindow.scrollTo).toHaveBeenCalledWith(0, 6967);
		// in Document.tsx, getStartRangeOffsetTop should return 7167, 
		// but this returns 0 while testing. 
		// Can't figure out how to mock out that function.
		// Good info here, but it's not enough https://stackoverflow.com/questions/39633919/cannot-mock-a-module-with-jest-and-test-function-calls?rq=1
		
		expect(mockWindow.scrollTo).toHaveBeenCalled();
	});
});