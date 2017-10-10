const loader = require("./foundation-loader");

//test('<p>abc123</p> to return <p data-offset="21">abc123</p>', () => {
test('<p>abc123</p> to return <p data="14">abc123</p>', () => {
  expect(loader("<p>abc123</p>")).toBe('<p data="14">abc123</p>');
});

test("<p><strong>We the people</strong> of the United States</p> to throw Error", () => {
  expect(() => {
    loader("<p><strong>We the people</strong> of the United States</p>");
  }).toThrow();
});

const longInput = `<p>We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.</p>
<h2>Article. I.</h2>
<h3>Section. 1.</h3>
<p>All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.</p>`;
const longOutput = `<p data="14">We the People of the United States, in Order to form a more perfect Union, establish Justice, insure domestic Tranquility, provide for the common defence, promote the general Welfare, and secure the Blessings of Liberty to ourselves and our Posterity, do ordain and establish this Constitution for the United States of America.</p> <h2 data="361">Article. I.</h2> <h3 data="393">Section. 1.</h3> <p data="424">All legislative Powers herein granted shall be vested in a Congress of the United States, which shall consist of a Senate and House of Representatives.</p>`;

test("longInput to return longOutput", () => {
  expect(loader(longInput)).toBe(longOutput);
});
