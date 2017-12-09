import { Foundation } from "../java2ts/Foundation";
import { TimelineItemData } from "../components/Timeline";

const videoFact: Foundation.VideoFactContent = {
  youtubeId: "ApTLB76Nmdg",
  speakers: [
    {
      firstname: "Martha",
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

const timelineItems: TimelineItemData[] = [
  {
    id: "c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg=",
    idx: "c7qu-ZE5SuipqSrOO30R3mnAA7K7nJ4fQ4zVIX0A2yg=",
    start: new Date("1788-06-21T00:00:00.000Z"),
    content: "United States Constitution",
    kind: "document"
  },
  {
    id: "pMHhbW_I-wquOfoyPFAVQu8DMLMpYVxhGT8R1x71hYA=",
    idx: "pMHhbW_I-wquOfoyPFAVQu8DMLMpYVxhGT8R1x71hYA=",
    start: new Date("1791-12-15T00:00:00.000Z"),
    content: "Bill of Rights",
    kind: "document"
  },
  {
    id: "-7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM=",
    idx: "-7DeOJAVJUsifUcIaZo7c41pol_guMxR6IEgYv28bHM=",
    start: new Date("1960-09-26T00:00:00.000Z"),
    content: "John F. Kennedy - Nixon (1/4)",
    kind: "video"
  },
  {
    id: "bl03RovlxbTZK0yu25_VikP0Y2xSj-J9oFyGUTWIOZQ=",
    idx: "bl03RovlxbTZK0yu25_VikP0Y2xSj-J9oFyGUTWIOZQ=",
    start: new Date("1960-10-07T00:00:00.000Z"),
    content: "John F. Kennedy - Nixon (2/4)",
    kind: "video"
  }
];

const documentFactLink: Foundation.FactLink = {
  fact: {
    title: "Amendment 13",
    primaryDate: "1865-12-06",
    primaryDateKind: "ratified",
    kind: "document"
  },
  hash: "o_dRqrNJ62wzlgLilTrLxkHqGmvAS9qTpa4z4pjyFqA="
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

const videoFactLink: Foundation.FactLink = {
  fact: {
    title: "Donald Trump - Hillary Clinton (2/3)",
    primaryDate: "2016-10-09",
    primaryDateKind: "recorded",
    kind: "video"
  },
  hash: "U8MV5KDDaxumxZOCJOzExAUAAkSoYNhycVXq7jZ59_0="
};

export { documentFactLink, documentNodes, timelineItems, videoFact, videoFactLink};