import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import {
  TimelinePreviewContainerBranch,
  TimelinePreviewContainerProps,
  TimelinePreviewContainerState
} from "./TimelinePreviewContainer";

jest.mock("./TimelinePreview", () => ({
  default: "TimelinePreview"
}));

const mockFn = jest.fn();

const containerProps = {
  factLink: {
    fact: {
      title: "Amendment 13",
      primaryDate: "1865-12-06",
      primaryDateKind: "ratified",
      kind: "document"
    },
    hash: "o_dRqrNJ62wzlgLilTrLxkHqGmvAS9qTpa4z4pjyFqA="
  }
};

const documentNodes = [
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

test("Preview loading", () => {
  const containerState: TimelinePreviewContainerState = {
    loading: true,
    error: false
  };

  const tree = renderer
    .create(
      <TimelinePreviewContainerBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Error loading Preview", () => {
  const containerState: TimelinePreviewContainerState = {
    loading: false,
    error: true
  };

  const tree = renderer
    .create(
      <TimelinePreviewContainerBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Document Preview", () => {
  const containerState: TimelinePreviewContainerState = {
    loading: false,
    error: false,
    nodes: documentNodes
  };

  const tree = renderer
    .create(
      <TimelinePreviewContainerBranch
        containerProps={containerProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Document Preview with highlights", () => {
  const extendedProps: TimelinePreviewContainerProps = {
    ...containerProps,
    offset: 248,
    ranges: {
      highlightedRange: [11, 53],
      viewRange: [0, 218]
    },
    setFactHandlers: {
      handleDocumentSetClick: jest.fn(),
      handleVideoSetClick: jest.fn()
    }
  };
  const containerState: TimelinePreviewContainerState = {
    loading: false,
    error: false,
    nodes: documentNodes
  };

  const tree = renderer
    .create(
      <TimelinePreviewContainerBranch
        containerProps={extendedProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Successfully loaded Video Preview", () => {
  const videoProps: TimelinePreviewContainerProps = {
    factLink: {
      fact: {
        title: "Donald Trump - Hillary Clinton (2/3)",
        primaryDate: "2016-10-09",
        primaryDateKind: "recorded",
        kind: "video"
      },
      hash: "U8MV5KDDaxumxZOCJOzExAUAAkSoYNhycVXq7jZ59_0="
    },
    setFactHandlers: {
      handleDocumentSetClick: jest.fn(),
      handleVideoSetClick: jest.fn()
    }
  };
  const containerState: TimelinePreviewContainerState = {
    loading: false,
    error: false,
    videoFact: {
      youtubeId: "ApTLB76Nmdg",
      speakers: [
        {
          firstname: "Martha",
          middlename: null,
          lastname: "Raddatz"
        }
      ],
      transcript: [
        {
          idx: 0,
          word: "Good ",
          timestamp: 0.75
        },
        {
          idx: 1,
          word: "evening ",
          timestamp: 0.96
        },
        {
          idx: 2,
          word: "I'm ",
          timestamp: 1.56
        },
        {
          idx: 3,
          word: "Martha ",
          timestamp: 1.92
        },
        {
          idx: 4,
          word: "Raddatz ",
          timestamp: 2.129
        },
        {
          idx: 5,
          word: "from ",
          timestamp: 2.52
        },
        {
          idx: 6,
          word: "ABC ",
          timestamp: 3.06
        },
        {
          idx: 7,
          word: "News. ",
          timestamp: 3.09
        }
      ],
      fact: {
        title: "Donald Trump - Hillary Clinton (2/3)",
        primaryDate: "2016-10-09",
        primaryDateKind: "recorded",
        kind: "video"
      }
    }
  };

  const tree = renderer
    .create(
      <TimelinePreviewContainerBranch
        containerProps={videoProps}
        containerState={containerState}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
