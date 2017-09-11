import { FoundationTextType } from "../components/Foundation";

export interface EvidenceBlock {
  index: number;
  type: FoundationTextType;
  range: [number, number];
}

interface Article {
  title: string;
  evidenceBlocks: EvidenceBlock[];
}

interface User {
  name: string;
  articles: Article[];
}

interface Document {
  type: FoundationTextType;
  heading: string;
  last_updated: Date;
}

interface DocumentExcerpt {
  name: string;
  document: FoundationTextType;
  highlightedRange: [number, number];
  viewRange?: [number, number];
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
      type: "CONSTITUTION",
      heading: "Constitution for the United States of America",
      last_updated: new Date("1992-05-05")
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
      name: "United States Constitution",
      document: "CONSTITUTION",
      highlightedRange: [0, 30412],
      date: "1788-06-21"
    },
    {
      name: "Bill of Rights",
      document: "CONSTITUTION",
      highlightedRange: [30434, 33609],
      date: "1791-12-15"
    },
    // {
    // 	name: "Amendment 1",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [30434, 30739],
    // 	date: "1791-12-15"
    // },
    // {
    // 	name: "Amendment 2",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [30761, 30939],
    // 	date: "1791-12-15"
    // },
    // {
    // 	name: "Amendment 3",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [30961, 31150],
    // 	date: "1791-12-15"
    // },
    // {
    // 	name: "Amendment 4",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [31172, 31537],
    // 	date: "1791-12-15"
    // },
    // {
    // 	name: "Amendment 5",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [31559, 32181],
    // 	date: "1791-12-15"
    // },
    // {
    // 	name: "Amendment 6",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [32203, 32714],
    // 	date: "1791-12-15"
    // },
    // {
    // 	name: "Amendment 7",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [32736, 33041],
    // 	date: "1791-12-15"
    // },
    // {
    // 	name: "Amendment 8",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [33063, 33207],
    // 	date: "1791-12-15"
    // },
    // {
    // 	name: "Amendment 9",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [33229, 33392],
    // 	date: "1791-12-15"
    // },
    // {
    // 	name: "Amendment 10",
    // 	document: "CONSTITUTION",
    // 	highlightedRange: [33414, 33609],
    // 	date: "1791-12-15"
    // },
    {
      name: "Amendment 11",
      document: "CONSTITUTION",
      highlightedRange: [33631, 33903],
      date: "1795-02-07"
    },
    {
      name: "Amendment 12",
      document: "CONSTITUTION",
      highlightedRange: [33925, 36297],
      date: "1804-06-15"
    },
    {
      name: "Amendment 13",
      document: "CONSTITUTION",
      highlightedRange: [36319, 36680],
      date: "1865-12-06"
    },
    {
      name: "Amendment 14",
      document: "CONSTITUTION",
      highlightedRange: [36702, 39402],
      date: "1868-07-09"
    },
    {
      name: "Amendment 15",
      document: "CONSTITUTION",
      highlightedRange: [39424, 39766],
      date: "1870-02-03"
    },
    {
      name: "Amendment 16",
      document: "CONSTITUTION",
      highlightedRange: [39788, 40015],
      date: "1913-02-03"
    },
    {
      name: "Amendment 17",
      document: "CONSTITUTION",
      highlightedRange: [40037, 40914],
      date: "1913-04-08"
    },
    {
      name: "Amendment 18",
      document: "CONSTITUTION",
      highlightedRange: [40936, 41727],
      date: "1919-01-16"
    },
    {
      name: "Amendment 19",
      document: "CONSTITUTION",
      highlightedRange: [41749, 42000],
      date: "1920-08-18"
    },
    {
      name: "Amendment 20",
      document: "CONSTITUTION",
      highlightedRange: [42022, 44106],
      date: "1933-01-23"
    },
    {
      name: "Amendment 21",
      document: "CONSTITUTION",
      highlightedRange: [44128, 44796],
      date: "1933-12-05"
    },
    {
      name: "Amendment 22",
      document: "CONSTITUTION",
      highlightedRange: [44818, 45818],
      date: "1951-02-27"
    },
    {
      name: "Amendment 23",
      document: "CONSTITUTION",
      highlightedRange: [45840, 46659],
      date: "1961-03-29"
    },
    {
      name: "Amendment 24",
      document: "CONSTITUTION",
      highlightedRange: [46681, 47170],
      date: "1964-01-23"
    },
    {
      name: "Amendment 25",
      document: "CONSTITUTION",
      highlightedRange: [47192, 49705],
      date: "1967-02-10"
    },
    {
      name: "Amendment 26",
      document: "CONSTITUTION",
      highlightedRange: [49727, 50066],
      date: "1971-07-01"
    },
    {
      name: "Amendment 27",
      document: "CONSTITUTION",
      highlightedRange: [50088, 50285],
      date: "1992-05-05"
    }
  ],
  users: [
    {
      name: "samples",
      articles: [
        {
          title: "does-a-law-mean-what-it-says-or-what-it-meant",
          evidenceBlocks: [
            {
              index: 6,
              type: "CONSTITUTION",
              range: [30794, 30939]
            },
            {
              index: 9,
              type: "CONSTITUTION",
              range: [30794, 30867]
            }
          ]
        },
        {
          title: "dont-worry-well-protect-the-constitution-for-you",
          evidenceBlocks: [
            {
              index: 1,
              type: "CONSTITUTION",
              range: [19343, 19970]
            }
          ]
        }
      ]
    }
  ]
};

export default database;
