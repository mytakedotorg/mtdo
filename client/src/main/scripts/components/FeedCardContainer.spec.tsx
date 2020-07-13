/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
import * as React from "react";
import * as renderer from "react-test-renderer";
import {
  FeedCardBranch,
  FeedCardContainerProps,
  FeedCardContainerState,
} from "./FeedCardContainer";
import {
  documentFactLink,
  documentNodes,
  videoFactFast,
} from "../utils/testUtils";

const videoProps: FeedCardContainerProps = {
  username: "samples",
  titleSlug: "why-its-so-hard-to-have-peace",
  title: "Why it's so hard to have peace",
  blocks: [
    {
      kind: "paragraph",
      text:
        "Today, anybody who wants to negotiate with a Muslim country is “weak”.",
    },
    {
      kind: "video",
      range: [304, 321],
      videoId: "iEfwIxM7MmnOKb7zt4HqW8IxUWy6F7a236fSOQlUUWI=",
    },
  ],
};

const documentProps: FeedCardContainerProps = {
  username: "samples",
  titleSlug: "does-a-law-mean-what-it-says-or-what-it-meant",
  title: "Does a law mean what it says, or what it meant?",
  blocks: [
    {
      kind: "document",
      excerptId: "pMHhbW_I-wquOfoyPFAVQu8DMLMpYVxhGT8R1x71hYA=",
      viewRange: [283, 439],
      highlightedRange: [283, 439],
    },
    {
      kind: "paragraph",
      text:
        "If our judges get to decide that the law means whatever they want it to mean, then we still live under a King, we’ve just changed his name to Judge. That’s why it’s important to apply consistent methodology when interpreting the law. But in this case, whether you’re a Textualist or an Originalist, I don’t see how the 2nd amendment allows for any of the gun restrictions in place today.",
    },
  ],
};

test("Card loading", () => {
  const containerProps = documentProps;
  const containerState: FeedCardContainerState = {
    loading: true,
  };

  const tree = renderer
    .create(
      <FeedCardBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Card w/ Document Fact", () => {
  const containerProps = documentProps;
  const containerState: FeedCardContainerState = {
    loading: false,
    document: {
      fact: documentFactLink.fact,
      nodes: documentNodes,
    },
  };

  const tree = renderer
    .create(
      <FeedCardBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Card w/ Video Fact", () => {
  const containerProps = videoProps;
  const containerState: FeedCardContainerState = {
    loading: false,
    videoFact: videoFactFast,
  };

  const tree = renderer
    .create(
      <FeedCardBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
