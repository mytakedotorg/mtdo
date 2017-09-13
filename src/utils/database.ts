import { FoundationTextType } from "../components/Foundation";
import { TakeBlock } from "../components/BlockEditor";

interface Article {
  title: string;
  titleSlug: string;
  blocks: TakeBlock[];
}

interface User {
  name: string;
  articles: Article[];
}

interface Document {
  type: FoundationTextType;
}

export interface DocumentExcerpt {
  title: string;
  document: FoundationTextType;
  range: [number, number];
  date: string;
}

interface Video {
  id: string;
  title: string;
  date: string;
}

interface Database {
  documents: Document[];
  videos: Video[];
  excerpts: DocumentExcerpt[];
  users: User[];
}

const database: Database = {
  documents: [
    {
      type: "CONSTITUTION"
    }
  ],
  videos: [
    {
      id: "qAqIKybNO38",
      title: "Jimmy Carter - Gerald Ford #1",
      date: "1976-09-23"
    },
    {
      id: "TjHjU0Eu26Y",
      title: "Jimmy Carter - Gerald Ford #2",
      date: "1976-10-06"
    },
    {
      id: "CipT04S0bVE",
      title: "Jimmy Carter - Gerald Ford #3",
      date: "1976-10-22"
    }
  ],
  excerpts: [
    {
      title: "United States Constitution",
      document: "CONSTITUTION",
      range: [0, 30412],
      date: "1788-06-21"
    },
    {
      title: "Bill of Rights",
      document: "CONSTITUTION",
      range: [30434, 33609],
      date: "1791-12-15"
    },
    // {
    // 	title: "Amendment 1",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [30434, 30739],
    // 	date: "1791-12-15"
    // },
    // {
    // 	title: "Amendment 2",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [30761, 30939],
    // 	date: "1791-12-15"
    // },
    // {
    // 	title: "Amendment 3",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [30961, 31150],
    // 	date: "1791-12-15"
    // },
    // {
    // 	title: "Amendment 4",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [31172, 31537],
    // 	date: "1791-12-15"
    // },
    // {
    // 	title: "Amendment 5",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [31559, 32181],
    // 	date: "1791-12-15"
    // },
    // {
    // 	title: "Amendment 6",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [32203, 32714],
    // 	date: "1791-12-15"
    // },
    // {
    // 	title: "Amendment 7",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [32736, 33041],
    // 	date: "1791-12-15"
    // },
    // {
    // 	title: "Amendment 8",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [33063, 33207],
    // 	date: "1791-12-15"
    // },
    // {
    // 	title: "Amendment 9",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [33229, 33392],
    // 	date: "1791-12-15"
    // },
    // {
    // 	title: "Amendment 10",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [33414, 33609],
    // 	date: "1791-12-15"
    // },
    {
      title: "Amendment 11",
      document: "CONSTITUTION",
      range: [33631, 33903],
      date: "1795-02-07"
    },
    {
      title: "Amendment 12",
      document: "CONSTITUTION",
      range: [33925, 36297],
      date: "1804-06-15"
    },
    {
      title: "Amendment 13",
      document: "CONSTITUTION",
      range: [36319, 36680],
      date: "1865-12-06"
    },
    {
      title: "Amendment 14",
      document: "CONSTITUTION",
      range: [36702, 39402],
      date: "1868-07-09"
    },
    {
      title: "Amendment 15",
      document: "CONSTITUTION",
      range: [39424, 39766],
      date: "1870-02-03"
    },
    {
      title: "Amendment 16",
      document: "CONSTITUTION",
      range: [39788, 40015],
      date: "1913-02-03"
    },
    {
      title: "Amendment 17",
      document: "CONSTITUTION",
      range: [40037, 40914],
      date: "1913-04-08"
    },
    {
      title: "Amendment 18",
      document: "CONSTITUTION",
      range: [40936, 41727],
      date: "1919-01-16"
    },
    {
      title: "Amendment 19",
      document: "CONSTITUTION",
      range: [41749, 42000],
      date: "1920-08-18"
    },
    {
      title: "Amendment 20",
      document: "CONSTITUTION",
      range: [42022, 44106],
      date: "1933-01-23"
    },
    {
      title: "Amendment 21",
      document: "CONSTITUTION",
      range: [44128, 44796],
      date: "1933-12-05"
    },
    {
      title: "Amendment 22",
      document: "CONSTITUTION",
      range: [44818, 45818],
      date: "1951-02-27"
    },
    {
      title: "Amendment 23",
      document: "CONSTITUTION",
      range: [45840, 46659],
      date: "1961-03-29"
    },
    {
      title: "Amendment 24",
      document: "CONSTITUTION",
      range: [46681, 47170],
      date: "1964-01-23"
    },
    {
      title: "Amendment 25",
      document: "CONSTITUTION",
      range: [47192, 49705],
      date: "1967-02-10"
    },
    {
      title: "Amendment 26",
      document: "CONSTITUTION",
      range: [49727, 50066],
      date: "1971-07-01"
    },
    {
      title: "Amendment 27",
      document: "CONSTITUTION",
      range: [50088, 50285],
      date: "1992-05-05"
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
              highlightedRange: [30794, 30939]
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
              highlightedRange: [30794, 30867]
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
