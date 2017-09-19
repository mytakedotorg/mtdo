import { FoundationTextType } from "../components/Foundation";
import { TakeBlock } from "../components/BlockEditor";

/**
 * Constraints:
 *  - titleSlug not null
 */
export interface Article {
  title: string;
  titleSlug: string;
  blocks: TakeBlock[];
}

/**
 * Constraints:
 *  - Username must be unique
 *  - All articles must have unique titleSlugs
 */
export interface User {
  name: string;
  articles: Article[] | null;
}

/**
 * Constraints:
 *  - Filename must be unique
 */
export interface DocumentExcerpt {
  title: string;
  filename: string;
  primaryDate: Date;
  primaryDateKind: "ratified" | "published";
}

/**
 * Constraints:
 *  - ID must be unique
 */
export interface Video {
  id: string;
  title: string;
  primaryDate: Date;
  primaryDateKind: "recorded";
}

export function isDocument(
  fact: DocumentExcerpt | Video | null
): fact is DocumentExcerpt {
  if (fact) {
    return (fact as DocumentExcerpt).filename !== undefined;
  } else {
    return false;
  }
}

export function isVideo(fact: DocumentExcerpt | Video | null): fact is Video {
  if (fact) {
    return (fact as Video).id !== undefined;
  } else {
    return false;
  }
}

export interface Database {
  excerpts: DocumentExcerpt[];
  videos: Video[];
  users: User[];
}

const database: Database = {
  videos: [
    {
      id: "qAqIKybNO38",
      title: "Jimmy Carter - Gerald Ford #1",
      primaryDate: new Date("1976-09-23"),
      primaryDateKind: "recorded"
    },
    {
      id: "TjHjU0Eu26Y",
      title: "Jimmy Carter - Gerald Ford #2",
      primaryDate: new Date("1976-10-06"),
      primaryDateKind: "recorded"
    },
    {
      id: "CipT04S0bVE",
      title: "Jimmy Carter - Gerald Ford #3",
      primaryDate: new Date("1976-10-22"),
      primaryDateKind: "recorded"
    }
  ],
  excerpts: [
    {
      title: "United States Constitution",
      filename: "united-states-constitution.foundation.html",
      primaryDate: new Date("1788-06-21"),
      primaryDateKind: "ratified"
    },
    {
      title: "Bill of Rights",
      filename: "bill-of-rights.foundation.html",
      primaryDate: new Date("1791-12-15"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 11",
      filename: "amendment-11.foundation.html",
      primaryDate: new Date("1795-02-07"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 12",
      filename: "amendment-12.foundation.html",
      primaryDate: new Date("1804-06-15"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 13",
      filename: "amendment-13.foundation.html",
      primaryDate: new Date("1865-12-06"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 14",
      filename: "amendment-14.foundation.html",
      primaryDate: new Date("1868-07-09"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 15",
      filename: "amendment-15.foundation.html",
      primaryDate: new Date("1870-02-03"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 16",
      filename: "amendment-16.foundation.html",
      primaryDate: new Date("1913-02-03"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 17",
      filename: "amendment-17.foundation.html",
      primaryDate: new Date("1913-04-08"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 18",
      filename: "amendment-18.foundation.html",
      primaryDate: new Date("1919-01-16"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 19",
      filename: "amendment-19.foundation.html",
      primaryDate: new Date("1920-08-18"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 20",
      filename: "amendment-20.foundation.html",
      primaryDate: new Date("1933-01-23"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 21",
      filename: "amendment-21.foundation.html",
      primaryDate: new Date("1933-12-05"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 22",
      filename: "amendment-22.foundation.html",
      primaryDate: new Date("1951-02-27"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 23",
      filename: "amendment-23.foundation.html",
      primaryDate: new Date("1961-03-29"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 24",
      filename: "amendment-24.foundation.html",
      primaryDate: new Date("1964-01-23"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 25",
      filename: "amendment-25.foundation.html",
      primaryDate: new Date("1967-02-10"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 26",
      filename: "amendment-26.foundation.html",
      primaryDate: new Date("1971-07-01"),
      primaryDateKind: "ratified"
    },
    {
      title: "Amendment 27",
      filename: "amendment-27.foundation.html",
      primaryDate: new Date("1992-05-05"),
      primaryDateKind: "ratified"
    }
  ],
  users: [
    {
      name: "samples",
      articles: [
        {
          title: "Does a law mean what it says, or what it meant?",
          titleSlug: "does-a-law-mean-what-it-says-or-what-it-meant",
          blocks: [
            {
              kind: "paragraph",
              text:
                "King: “I hereby declare that Seabiscuit shall be my royal horse!”"
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
              excerptId: "bill-of-rights",
              highlightedRange: [368, 513]
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
              excerptId: "bill-of-rights",
              highlightedRange: [368, 442]
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
        },
        {
          title: "Don't worry, we'll protect the Constitution for you!",
          titleSlug: "dont-worry-well-protect-the-constitution-for-you",
          blocks: [
            {
              kind: "paragraph",
              text:
                "The system for appointing judges to the Supreme Court is quite complex. Only a lawyer with years of experience could understand it. But trust me – this President has no right to make an appointment! We’ll let the people decide in the next election, as demanded by our Constitution!!"
            },
            {
              kind: "document",
              excerptId: "united-states-constitution",
              highlightedRange: [19343, 19970]
            },
            {
              kind: "paragraph",
              text:
                "Don’t bother reading the Constitution, it’s only for smart people like me. Trust me – the President is way out of line to think the Senate has any obligation to give his candidate a hearing!"
            }
          ]
        }
      ]
    }
  ]
};

export default database;
