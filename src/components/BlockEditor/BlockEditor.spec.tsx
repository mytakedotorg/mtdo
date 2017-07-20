// https://facebook.github.io/jest/docs/snapshot-testing.html#content

import * as React from "react";
import * as renderer from "react-test-renderer";
import BlockEditor from './BlockEditor';
import { TakeDocument } from './BlockEditor';

const initialDoc: TakeDocument = {
    title: "My take title",
    blocks: [
        {
						id: 0,
            kind: 'paragraph',
						text: 'Some text',
						active: false,
						hover: false
        },
        {
						id: 1,
            kind: 'paragraph',
            text: 'Some other text',
						active: false,
						hover: false
        }
    ]
};


test('Simple block editor model', () => {
    const tree = renderer.create(
        <BlockEditor takeDocument={initialDoc} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
})

const activeDoc: TakeDocument = {
    title: "My take title",
    blocks: [
        {
						id: 0,
            kind: 'paragraph',
						text: 'Some text',
						active: true,
						hover: false,
        },
        {
						id: 1,
            kind: 'paragraph',
						text: 'Some other text',
						active: false,
						hover: false
        }
    ]
};

test('With active', () => {
    const tree = renderer.create(
        <BlockEditor takeDocument={activeDoc} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
})

const hoverDoc: TakeDocument = {
    title: "My take title",
    blocks: [
        {
						id: 0,
            kind: 'paragraph',
						text: 'Some text',
						active: false,
						hover: true,
        },
        {
						id: 1,
            kind: 'paragraph',
						text: 'Some other text',
						active: false,
						hover: false
        }
    ]
};

test('With hover', () => {
    const tree = renderer.create(
        <BlockEditor takeDocument={hoverDoc} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
})

const hoverAndActiveDoc: TakeDocument = {
    title: "My take title",
    blocks: [
        {
						id: 0,
            kind: 'paragraph',
						text: 'Some text',
						active: true,
						hover: true,
        },
        {
						id: 1,
            kind: 'paragraph',
						text: 'Some other text',
						active: false,
						hover: false
        }
    ]
};

test('With hover and active', () => {
    const tree = renderer.create(
        <BlockEditor takeDocument={hoverAndActiveDoc} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
})
