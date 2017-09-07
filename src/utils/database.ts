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

interface Database {
  documents: Document[];
  users: User[];
}

interface Document {
  type: FoundationTextType;
  heading: string;
}
const database: Database = {
  documents: [
    {
      type: "CONSTITUTION",
      heading: "Constitution for the United States of America"
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
