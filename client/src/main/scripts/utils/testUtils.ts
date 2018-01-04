import { Foundation } from "../java2ts/Foundation";
import { TimelineItemData } from "../components/Timeline";
import { FoundationNode } from "./functions";
import { Card } from "../components/FeedList";
import { TakeDocument } from "../components/BlockEditor";

const videoFact: Foundation.VideoFactContent = {
  youtubeId: "ApTLB76Nmdg",
  speakers: [
    {
      firstname: "Martha",
      lastname: "Raddatz"
    },
    {
      firstname: "Anderson",
      lastname: "Cooper"
    }
  ],
  speakerMap: [
    {
      speaker: "Raddatz",
      range: [0, 7]
    },
    {
      speaker: "Cooper",
      range: [8, 89]
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
    },
    {
      idx: 8,
      word: "And ",
      timestamp: 3.659
    },
    {
      idx: 9,
      word: "I'm ",
      timestamp: 3.87
    },
    {
      idx: 10,
      word: "Anderson ",
      timestamp: 4.259
    },
    {
      idx: 11,
      word: "Cooper ",
      timestamp: 4.529
    },
    {
      idx: 12,
      word: "from ",
      timestamp: 4.68
    },
    {
      idx: 13,
      word: "CNN. ",
      timestamp: 5.1
    },
    {
      idx: 14,
      word: "We ",
      timestamp: 5.31
    },
    {
      idx: 15,
      word: "want ",
      timestamp: 5.49
    },
    {
      idx: 16,
      word: "to ",
      timestamp: 5.549
    },
    {
      idx: 17,
      word: "welcome ",
      timestamp: 5.7
    },
    {
      idx: 18,
      word: "you ",
      timestamp: 5.879
    },
    {
      idx: 19,
      word: "to ",
      timestamp: 6.089
    },
    {
      idx: 20,
      word: "Washington ",
      timestamp: 6.24
    },
    {
      idx: 21,
      word: "University ",
      timestamp: 7.2
    },
    {
      idx: 22,
      word: "in ",
      timestamp: 7.29
    },
    {
      idx: 23,
      word: "St. ",
      timestamp: 7.529
    },
    {
      idx: 24,
      word: "Louis ",
      timestamp: 7.799
    },
    {
      idx: 25,
      word: "for ",
      timestamp: 8.01
    },
    {
      idx: 26,
      word: "the ",
      timestamp: 8.429
    },
    {
      idx: 27,
      word: "second ",
      timestamp: 8.88
    },
    {
      idx: 28,
      word: "presidential ",
      timestamp: 9.24
    },
    {
      idx: 29,
      word: "debate ",
      timestamp: 9.69
    },
    {
      idx: 30,
      word: "between ",
      timestamp: 9.719
    },
    {
      idx: 31,
      word: "Hillary ",
      timestamp: 10.29
    },
    {
      idx: 32,
      word: "Clinton ",
      timestamp: 10.32
    },
    {
      idx: 33,
      word: "and ",
      timestamp: 10.679
    },
    {
      idx: 34,
      word: "Donald ",
      timestamp: 10.889
    },
    {
      idx: 35,
      word: "Trump ",
      timestamp: 11.389
    },
    {
      idx: 36,
      word: "sponsored ",
      timestamp: 12.389
    },
    {
      idx: 37,
      word: "by ",
      timestamp: 12.48
    },
    {
      idx: 38,
      word: "the ",
      timestamp: 12.54
    },
    {
      idx: 39,
      word: "Commission ",
      timestamp: 12.99
    },
    {
      idx: 40,
      word: "on ",
      timestamp: 13.08
    },
    {
      idx: 41,
      word: "Presidential ",
      timestamp: 13.65
    },
    {
      idx: 42,
      word: "Debates. ",
      timestamp: 13.88
    },
    {
      idx: 43,
      word: "tonight's ",
      timestamp: 14.88
    },
    {
      idx: 44,
      word: "debate ",
      timestamp: 15.15
    },
    {
      idx: 45,
      word: "is ",
      timestamp: 15.389
    },
    {
      idx: 46,
      word: "a ",
      timestamp: 15.45
    },
    {
      idx: 47,
      word: "Town ",
      timestamp: 15.87
    },
    {
      idx: 48,
      word: "Hall ",
      timestamp: 16.109
    },
    {
      idx: 49,
      word: "format, ",
      timestamp: 16.139
    },
    {
      idx: 50,
      word: "which ",
      timestamp: 16.8
    },
    {
      idx: 51,
      word: "gives ",
      timestamp: 17.01
    },
    {
      idx: 52,
      word: "voters ",
      timestamp: 17.43
    },
    {
      idx: 53,
      word: "a ",
      timestamp: 17.46
    },
    {
      idx: 54,
      word: "chance ",
      timestamp: 17.609
    },
    {
      idx: 55,
      word: "to ",
      timestamp: 18.119
    },
    {
      idx: 56,
      word: "directly ",
      timestamp: 18.63
    },
    {
      idx: 57,
      word: "ask ",
      timestamp: 18.81
    },
    {
      idx: 58,
      word: "the ",
      timestamp: 18.99
    },
    {
      idx: 59,
      word: "candidates ",
      timestamp: 19.41
    },
    {
      idx: 60,
      word: "questions. ",
      timestamp: 19.789
    },
    {
      idx: 61,
      word: "Martha ",
      timestamp: 20.789
    },
    {
      idx: 62,
      word: "and ",
      timestamp: 20.88
    },
    {
      idx: 63,
      word: "I ",
      timestamp: 20.939
    },
    {
      idx: 64,
      word: "will ",
      timestamp: 21.15
    },
    {
      idx: 65,
      word: "ask ",
      timestamp: 21.3
    },
    {
      idx: 66,
      word: "follow-up ",
      timestamp: 21.689
    },
    {
      idx: 67,
      word: "questions ",
      timestamp: 21.81
    },
    {
      idx: 68,
      word: "but ",
      timestamp: 22.47
    },
    {
      idx: 69,
      word: "the ",
      timestamp: 22.59
    },
    {
      idx: 70,
      word: "night ",
      timestamp: 22.769
    },
    {
      idx: 71,
      word: "really ",
      timestamp: 23.039
    },
    {
      idx: 72,
      word: "belongs ",
      timestamp: 23.46
    },
    {
      idx: 73,
      word: "to ",
      timestamp: 23.76
    },
    {
      idx: 74,
      word: "the ",
      timestamp: 23.85
    },
    {
      idx: 75,
      word: "people ",
      timestamp: 24.15
    },
    {
      idx: 76,
      word: "in ",
      timestamp: 24.24
    },
    {
      idx: 77,
      word: "this ",
      timestamp: 24.39
    },
    {
      idx: 78,
      word: "room ",
      timestamp: 24.689
    },
    {
      idx: 79,
      word: "and ",
      timestamp: 24.99
    },
    {
      idx: 80,
      word: "to ",
      timestamp: 25.019
    },
    {
      idx: 81,
      word: "people ",
      timestamp: 25.71
    },
    {
      idx: 82,
      word: "across ",
      timestamp: 25.8
    },
    {
      idx: 83,
      word: "the ",
      timestamp: 26.13
    },
    {
      idx: 84,
      word: "country ",
      timestamp: 26.31
    },
    {
      idx: 85,
      word: "who ",
      timestamp: 26.64
    },
    {
      idx: 86,
      word: "have ",
      timestamp: 26.67
    },
    {
      idx: 87,
      word: "submitted ",
      timestamp: 26.939
    },
    {
      idx: 88,
      word: "questions ",
      timestamp: 27.51
    },
    {
      idx: 89,
      word: "online. ",
      timestamp: 28.17
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

const documentNodes: FoundationNode[] = [
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

const videoNodes: FoundationNode[] = [
  {
    component: "p",
    offset: 0,
    innerHTML: ["Good evening I'm Martha Raddatz from ABC News."]
  },
  {
    component: "p",
    offset: 46,
    innerHTML: [
      "And I'm Anderson Cooper from CNN. We want to welcome you to Washington University in St. Louis for the second presidential debate between Hillary Clinton and Donald Trump sponsored by the Commission on Presidential Debates. tonight's debate is a Town Hall format, which gives voters a chance to directly ask the candidates questions. Martha and I will ask follow-up questions but the night really belongs to the people in this room and to people across the country who have submitted questions online."
    ]
  }
];

const cards: Card[] = [
  {
    username: "samples",
    titleSlug: "why-its-so-hard-to-have-peace",
    title: "Why it's so hard to have peace",
    blocks: [
      {
        kind: "paragraph",
        text:
          "During the cold war, anybody who wanted to negotiate with the evil Communists was “weak”."
      },
      {
        kind: "paragraph",
        text:
          "Today, anybody who wants to negotiate with a Muslim country is “weak”."
      },
      {
        kind: "video",
        range: [304, 321],
        videoId: "U8MV5KDDaxumxZOCJOzExAUAAkSoYNhycVXq7jZ59_0="
      },
      {
        kind: "paragraph",
        text:
          "Thank goodness there's at least one party who is willing to give peace a chance!"
      },
      {
        kind: "video",
        range: [246, 261],
        videoId: "qQjcS7ARkHHdKnDXfS3OkX5f78l81M1OWu5y_IziPA0="
      },
      {
        kind: "paragraph",
        text: "Err..  Surely that's an outlier?"
      },
      {
        kind: "video",
        range: [190, 203],
        videoId: "qQjcS7ARkHHdKnDXfS3OkX5f78l81M1OWu5y_IziPA0="
      },
      {
        kind: "paragraph",
        text:
          "Huh.  Too bad Jimmy Carter didn't think of something as catchy as MAGA."
      }
    ],
    previewBlocks: [1, 2]
  },
  {
    username: "samples",
    titleSlug: "dont-worry-well-protect-the-constitution-for-you",
    title: "Don't worry, we'll protect the Constitution for you!",
    blocks: [
      {
        kind: "paragraph",
        text:
          "The system for appointing judges to the Supreme Court is quite complex. Only a lawyer with years of experience could understand it. But trust me – this President has no right to make an appointment! We’ll let the people decide in the next election, as demanded by our Constitution!!"
      },
      {
        kind: "document",
        excerptId: "hAGBMHs7k2yx_cmgp8I7r9VFE_NCuQ-QXsfDxjt9LJA=",
        viewRange: [17730, 18357],
        highlightedRange: [17730, 18357]
      },
      {
        kind: "paragraph",
        text:
          "Don’t bother reading the Constitution, it’s only for smart people like me. Trust me – the President is way out of line to think the Senate has any obligation to give his candidate a hearing!"
      }
    ],
    previewBlocks: [1, 0]
  }
];

const takeDocument: TakeDocument = {
  title: "Does a law mean what it says, or what it meant?",
  blocks: [
    {
      kind: "paragraph",
      text: "King: “I hereby declare that Seabiscuit shall be my royal horse!”"
    },
    {
      kind: "paragraph",
      text: "Subject: “But that’s MY horse!!”"
    },
    {
      kind: "paragraph",
      text:
        "King: “I said it – it’s the law of the land. Thief! Return my horse to me!”"
    },
    {
      kind: "paragraph",
      text: "..."
    },
    {
      kind: "paragraph",
      text:
        "That’s how people lived for a long time. The fix was to write laws down, so that the power of the government would no longer be subject to the arbitrary whims of any one person. Only trouble is, what does a law mean?"
    },
    {
      kind: "paragraph",
      text:
        "Textualism says that a law means what it says in its text. Simple enough. On the other hand, Originalism says that a law means what was meant when it was originally written. Figuring this out is a little trickier – you’ve got to be not just a lawyer but also an historian to have any chance of understanding the law. The upside of Originalism is that it can help the law to be more stable against the whims of a changing culture – our Constitution is more than 220 years old, and a lot has changed since then! A great example is the 2nd amendment:"
    },
    {
      kind: "document",
      excerptId: "pMHhbW_I-wquOfoyPFAVQu8DMLMpYVxhGT8R1x71hYA=",
      viewRange: [283, 439],
      highlightedRange: [283, 439]
    },
    {
      kind: "paragraph",
      text:
        "The Arms of the 21st century are a lot different than the Arms of 1789! A textualist has little choice in interpreting this law – clearly automatic rifles, grenades, rockets, and even nukes are protected. They are Arms, afterall!"
    },
    {
      kind: "paragraph",
      text:
        "An originalist has to go back to 1789 to understand the original meaning. Black powder muskets were the most powerful Arms of the time, so perhaps that is what the law should protect today? Although that captures the original technology, it doesn’t capture the original intent."
    },
    {
      kind: "document",
      excerptId: "pMHhbW_I-wquOfoyPFAVQu8DMLMpYVxhGT8R1x71hYA=",
      viewRange: [283, 439],
      highlightedRange: [294, 368]
    },
    {
      kind: "paragraph",
      text:
        "In 1776, George Washington led an American militia to victory against a tyrannical royal crown. As the newly free colonies organized their national government, many were afraid that it might be just as oppressive as the royal crown had been. It sure seems like the original intent of the 2nd amendment was to enshrine the right of the citizenry to have the means for armed rebellion."
    },
    {
      kind: "paragraph",
      text:
        "If our judges get to decide that the law means whatever they want it to mean, then we still live under a King, we’ve just changed his name to Judge. That’s why it’s important to apply consistent methodology when interpreting the law. But in this case, whether you’re a Textualist or an Originalist, I don’t see how the 2nd amendment allows for any of the gun restrictions in place today."
    }
  ]
};

export {
  cards,
  documentFactLink,
  documentNodes,
  takeDocument,
  timelineItems,
  videoFact,
  videoFactLink,
  videoNodes
};
