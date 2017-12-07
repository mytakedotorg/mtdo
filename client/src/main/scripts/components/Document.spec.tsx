import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import Document from "./Document";

const nodes = [
  {
    component: "p",
    innerHTML: [
      "Section 1. Neither slavery nor involuntary servitude, except as a punishment for crime whereof the party shall have been duly convicted, shall exist within the United States, or any place subject to their jurisdiction."
    ],
    offset: 0
  },
  {
    component: "p",
    innerHTML: [
      "Section 2. Congress shall have power to enforce this article by appropriate legislation."
    ],
    offset: 218
  }
];
const className = "document__row";
const onMouseUp = jest.fn();

test("Document component", () => {
  const tree = renderer
    .create(
      <Document nodes={nodes} className={className} onMouseUp={onMouseUp} />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

const children = (
  <div className="editor__block editor__block--overlay" style={{ top: "16px" }}>
    <div className="editor__document editor__document--hover">
      <p data-char-offset="0">
        Section 1.{" "}
        <span className="document__text--selected">
          Neither slavery nor involuntary servitude
        </span>, except as a punishment for crime whereof the party shall have
        been duly convicted, shall exist within the United States, or any place
        subject to their jurisdiction.
      </p>
    </div>
  </div>
);

test("Document component with highlights", () => {
  const tree = renderer
    .create(
      <Document nodes={nodes} className={className} onMouseUp={onMouseUp}>
        {children}
      </Document>
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
