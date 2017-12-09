import * as React from "react";
import * as renderer from "react-test-renderer";
import {} from "jest";
import Video from "./Video";
import { Foundation } from "../java2ts/Foundation";

jest.mock("react-youtube", () => ({
  default: "YouTube"
}));

jest.mock("./CaptionView", () => ({
  default: "CaptionView"
}));

const mockFn = jest.fn();

const videoFact: Foundation.VideoFactContent = {
  youtubeId: "ApTLB76Nmdg",
  speakers: [
    {
      firstname: "Martha",
      middlename: null,
      lastname: "Raddatz"
    }
  ],
  speakerMap: [
    {
      speaker: "Raddatz",
      range: [0, 7]
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
};

test("Video", () => {
  const tree = renderer
    .create(
      <Video
        videoFact={videoFact}
        onSetClick={mockFn}
        className={"video__inner-container"}
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});

test("Video with highlights", () => {
  const tree = renderer
    .create(
      <Video
        videoFact={videoFact}
        onSetClick={mockFn}
        className={"video__inner-container"}
        timeRange={[0, 3]} // Test range can't go outside of videoFact.transcript range
      />
    )
    .toJSON();
  expect(tree).toMatchSnapshot();
});
