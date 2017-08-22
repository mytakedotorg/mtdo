import { FoundationTextType } from "../components/Foundation";

export interface BlockIndexMetaData {
  type: FoundationTextType;
  range: [number, number];
}
interface BlockIndex {
  [index: number]: BlockIndexMetaData;
}
interface ArticleMetaData {
  [title: string]: BlockIndex;
}
interface UserMetaData {
  [user: string]: ArticleMetaData;
}

const database: UserMetaData = {
  samples: {
    "does-a-law-mean-what-it-says-or-what-it-meant": {
      6: {
        type: "AMENDMENTS",
        range: [369, 514]
      },
      9: {
        type: "AMENDMENTS",
        range: [369, 442]
      }
    },
    "dont-worry-well-protect-the-constitution-for-you": {
      1: {
        type: "CONSTITUTION",
        range: [19343, 19970]
      }
    }
  }
};

export default database;
