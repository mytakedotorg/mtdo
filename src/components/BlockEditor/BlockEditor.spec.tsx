// https://facebook.github.io/jest/docs/snapshot-testing.html#content

import * as React from "react";
import * as renderer from "react-test-renderer";
import BlockEditor from './BlockEditor';
import { TakeDocument } from './BlockEditor';

let doc: TakeDocument = {
    title: "My take title",
    blocks: [
        {
            kind: 'paragraph',
            text: 'Some text'
        },
        {
            kind: 'document',
            document: 'Constitution',
            range: [1, 25]
        }
    ]
};

test('Simple block editor model', () => {
    const tree = renderer.create(
        <BlockEditor blocks={doc.blocks} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
})

test('With active', () => {
    const tree = renderer.create(
        <BlockEditor blocks={doc.blocks} active={0} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
})

test('With hover', () => {
    const tree = renderer.create(
        <BlockEditor blocks={doc.blocks} hover={0} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
})

test('With hover and active', () => {
    const tree = renderer.create(
        <BlockEditor blocks={doc.blocks} hover={0} active={0} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
})
