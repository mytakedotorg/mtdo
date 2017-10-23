import { TakeBlock } from "../components/BlockEditor";

/**
 * Constraints:
 *  - titleSlug not null
 */
export interface Article {
  title: string;
  titleSlug: string;
  blocks: TakeBlock[];
  previewBlocks: number[];
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
export interface DocumentFact {
  title: string;
  filename: string;
  primaryDate: Date;
  primaryDateKind: "ratified" | "published";
}

/**
 * Constraints:
 *  - ID must be unique
 */
export interface VideoFact {
  id: string;
  title: string;
  primaryDate: Date;
  primaryDateKind: "recorded";
  captionFile?: string; //JSON.stringify(CaptionWord[])
  captionMeta?: CaptionMeta;
}

export interface CaptionMeta {
  speakers: Person[];
  speakerMap: SpeakerMap[];
}

export interface CaptionWord {
  idx: number;
  word: string;
  timestamp: string; //Like "00:00:00.750"
}

interface Person {
  firstname: string;
  middlename?: string;
  lastname: string;
}

interface SpeakerMap {
  speaker: string; //Last name of Person object
  range: [number, number];
}

export function isDocument(
  fact: DocumentFact | VideoFact | null
): fact is DocumentFact {
  if (fact) {
    return (fact as DocumentFact).filename !== undefined;
  } else {
    return false;
  }
}

export function isVideo(
  fact: DocumentFact | VideoFact | null
): fact is VideoFact {
  if (fact) {
    return (fact as VideoFact).id !== undefined;
  } else {
    return false;
  }
}

export interface Database {
  excerpts: DocumentFact[];
  videos: VideoFact[];
  users: User[];
}

const database: Database = {
  videos: [
    {
      id: "Txkwp5AUfCg",
      title: "John F. Kennedy - Nixon (1/4)",
      primaryDate: new Date("1960-09-26"),
      primaryDateKind: "recorded"
    },
    {
      id: "z-4VeDta7Mo",
      title: "John F. Kennedy - Nixon (2/4)",
      primaryDate: new Date("1960-10-07"),
      primaryDateKind: "recorded"
    },
    {
      id: "8SdDhojNT2o",
      title: "John F. Kennedy - Nixon (3/4)",
      primaryDate: new Date("1960-10-13"),
      primaryDateKind: "recorded"
    },
    {
      id: "LN8F1FGZfzA",
      title: "John F. Kennedy - Nixon (4/4)",
      primaryDate: new Date("1960-10-21"),
      primaryDateKind: "recorded"
    },
    {
      id: "GlPjW_2_LXI",
      title: "Jimmy Carter - Gerald Ford (1/3)",
      primaryDate: new Date("1976-09-23"),
      primaryDateKind: "recorded"
    },
    {
      //id: "TjHjU0Eu26Y",  // Original video
      //id: "vIZ6w0kMqUA", // Trimmed for dev work, with captions
      id: "GX1kHw2tmtI", // Full with captions
      title: "Jimmy Carter - Gerald Ford (2/3)",
      primaryDate: new Date("1976-10-06"),
      primaryDateKind: "recorded",
      captionFile: "carter-ford-2.vtt",
      captionMeta: {
        speakers: [
          {
            firstname: "Pauline",
            lastname: "Frederick"
          },
          {
            firstname: "Max",
            lastname: "Frankel"
          },
          {
            firstname: "Jimmy",
            lastname: "Carter"
          },
          {
            firstname: "Gerald",
            middlename: "R",
            lastname: "Ford"
          },
          {
            firstname: "Henry",
            middlename: "L",
            lastname: "Trewhitt"
          },
          {
            firstname: "Richard",
            lastname: "Valeriani"
          }
        ],
        speakerMap: [
          {
            speaker: "Frederick",
            range: [0, 292]
          },
          {
            speaker: "Frankel",
            range: [293, 415]
          },
          {
            speaker: "Carter",
            range: [416, 843]
          },
          {
            speaker: "Frederick",
            range: [844, 850]
          },
          {
            speaker: "Ford",
            range: [851, 1141]
          },
          {
            speaker: "Frederick",
            range: [1142, 1148]
          },
          {
            speaker: "Trewhitt",
            range: [1149, 1258]
          },
          {
            speaker: "Ford",
            range: [1259, 1691]
          },
          {
            speaker: "Carter",
            range: [1692, 2001]
          },
          {
            speaker: "Frederick",
            range: [2002, 2008]
          },
          {
            speaker: "Valeriani",
            range: [2009, 2114]
          },
          {
            speaker: "Carter",
            range: [2115, 2600]
          },
          {
            speaker: "Valeriani",
            range: [2601, 2622]
          },
          {
            speaker: "Carter",
            range: [2623, 2871]
          },
          {
            speaker: "Frederick",
            range: [2872, 2878]
          },
          {
            speaker: "Ford",
            range: [2879, 3161]
          },
          {
            speaker: "Frederick",
            range: [3162, 3168]
          },
          {
            speaker: "Frankel",
            range: [3169, 3317]
          },
          {
            speaker: "Ford",
            range: [3318, 3704]
          },
          {
            speaker: "Frankel",
            range: [3705, 3775]
          },
          {
            speaker: "Ford",
            range: [3776, 3892]
          },
          {
            speaker: "Frederick",
            range: [3893, 3896]
          },
          {
            speaker: "Carter",
            range: [3897, 4258]
          },
          {
            speaker: "Frederick",
            range: [4259, 4265]
          },
          {
            speaker: "Trewhitt",
            range: [4266, 4375]
          },
          {
            speaker: "Carter",
            range: [4376, 4894]
          },
          {
            speaker: "Trewhitt",
            range: [4895, 4957]
          },
          {
            speaker: "Carter",
            range: [4958, 5037]
          },
          {
            speaker: "Frederick",
            range: [5038, 5039]
          },
          {
            speaker: "Ford",
            range: [5040, 5305]
          },
          {
            speaker: "Frederick",
            range: [5306, 5312]
          },
          {
            speaker: "Valeriani",
            range: [5313, 5390]
          },
          {
            speaker: "Ford",
            range: [5391, 5595]
          },
          {
            speaker: "Valeriani",
            range: [5596, 5604]
          },
          {
            speaker: "Ford",
            range: [5605, 5664]
          },
          {
            speaker: "Frederick",
            range: [5665, 5666]
          },
          {
            speaker: "Carter",
            range: [5667, 5905]
          },
          {
            speaker: "Frederick",
            range: [5906, 5912]
          },
          {
            speaker: "Frankel",
            range: [5913, 6020]
          },
          {
            speaker: "Carter",
            range: [6021, 6480]
          },
          {
            speaker: "Frankel",
            range: [6481, 6544]
          },
          {
            speaker: "Carter",
            range: [6545, 6707]
          },
          {
            speaker: "Frederick",
            range: [6708, 6709]
          },
          {
            speaker: "Ford",
            range: [6710, 6986]
          },
          {
            speaker: "Frederick",
            range: [6987, 6993]
          },
          {
            speaker: "Trewhitt",
            range: [6994, 7098]
          },
          {
            speaker: "Ford",
            range: [7099, 7456]
          },
          {
            speaker: "Trewhitt",
            range: [7457, 7558]
          },
          {
            speaker: "Ford",
            range: [7559, 7726]
          },
          {
            speaker: "Frederick",
            range: [7727, 7728]
          },
          {
            speaker: "Carter",
            range: [7729, 8056]
          },
          {
            speaker: "Frederick",
            range: [8057, 8063]
          },
          {
            speaker: "Valeriani",
            range: [8064, 8124]
          },
          {
            speaker: "Carter",
            range: [8125, 8454]
          },
          {
            speaker: "Frederick",
            range: [8455, 8456]
          },
          {
            speaker: "Ford",
            range: [8457, 8706]
          },
          {
            speaker: "Frederick",
            range: [8707, 8713]
          },
          {
            speaker: "Frankel",
            range: [8714, 8946]
          },
          {
            speaker: "Ford",
            range: [8947, 9349]
          },
          {
            speaker: "Frankel",
            range: [9350, 9413]
          },
          {
            speaker: "Ford",
            range: [9414, 9677]
          },
          {
            speaker: "Frederick",
            range: [9678, 9679]
          },
          {
            speaker: "Carter",
            range: [9680, 10018]
          },
          {
            speaker: "Frederick",
            range: [10019, 10079]
          },
          {
            speaker: "Trewhitt",
            range: [10080, 10133]
          },
          {
            speaker: "Carter",
            range: [10134, 10339]
          },
          {
            speaker: "Frederick",
            range: [10340, 10341]
          },
          {
            speaker: "Ford",
            range: [10342, 10476]
          },
          {
            speaker: "Frederick",
            range: [10477, 10483]
          },
          {
            speaker: "Valeriani",
            range: [10484, 10546]
          },
          {
            speaker: "Ford",
            range: [10547, 10842]
          },
          {
            speaker: "Frederick",
            range: [10843, 10844]
          },
          {
            speaker: "Carter",
            range: [10845, 11105]
          },
          {
            speaker: "Frederick",
            range: [11106, 11125]
          },
          {
            speaker: "Frankel",
            range: [11126, 11153]
          },
          {
            speaker: "Carter",
            range: [11154, 11357]
          },
          {
            speaker: "Frederick",
            range: [11358, 11359]
          },
          {
            speaker: "Ford",
            range: [11360, 11606]
          },
          {
            speaker: "Frederick",
            range: [11607, 11615]
          },
          {
            speaker: "Trewhitt",
            range: [11616, 11651]
          },
          {
            speaker: "Ford",
            range: [11652, 11735]
          },
          {
            speaker: "Frederick",
            range: [11736, 11737]
          },
          {
            speaker: "Carter",
            range: [11738, 11923]
          },
          {
            speaker: "Frederick",
            range: [11924, 11974]
          },
          {
            speaker: "Carter",
            range: [11975, 12436]
          },
          {
            speaker: "Frederick",
            range: [12437, 12438]
          },
          {
            speaker: "Ford",
            range: [12439, 12552]
          },
          {
            speaker: "Frederick",
            range: [12553, 12661]
          }
        ]
      }
    },
    {
      id: "CipT04S0bVE",
      title: "Jimmy Carter - Gerald Ford (3/3)",
      primaryDate: new Date("1976-10-22"),
      primaryDateKind: "recorded"
    },
    {
      id: "_8YxFc_1b_0",
      title: "Ronald Reagan - Jimmy Carter (1/1)",
      primaryDate: new Date("1980-10-28"),
      primaryDateKind: "recorded"
    },
    {
      id: "OGvBFQQPRXs",
      title: "Ronald Reagan - Walter Mondale (1/2)",
      primaryDate: new Date("1984-10-07"),
      primaryDateKind: "recorded"
    },
    {
      id: "EF73k5-Hiqg",
      title: "Ronald Reagan - Walter Mondale (2/2)",
      primaryDate: new Date("1984-10-21"),
      primaryDateKind: "recorded"
    },
    {
      id: "PbSzCpUyLPc",
      title: "George H.W. Bush - Michael Dukakis (1/2)",
      primaryDate: new Date("1988-09-25"),
      primaryDateKind: "recorded"
    },
    {
      id: "OGpROh7Ia10",
      title: "George H.W. Bush - Michael Dukakis (2/2)",
      primaryDate: new Date("1988-10-13"),
      primaryDateKind: "recorded"
    },
    {
      id: "XD_cXN9O9ds",
      title: "Bill Clinton - George H.W. Bush (1/3)",
      primaryDate: new Date("1992-10-11"),
      primaryDateKind: "recorded"
    },
    {
      id: "m6sUGKAm2YQ",
      title: "Bill Clinton - George H.W. Bush (2/3)",
      primaryDate: new Date("1992-10-15"),
      primaryDateKind: "recorded"
    },
    {
      id: "jCGtHqIwKek",
      title: "Bill Clinton - George H.W. Bush (3/3)",
      primaryDate: new Date("1992-10-19"),
      primaryDateKind: "recorded"
    },
    {
      id: "lZhyS5OtPto",
      title: "Bill Clinton - Bob Dole (1/2)",
      primaryDate: new Date("1996-10-06"),
      primaryDateKind: "recorded"
    },
    {
      id: "I1fcJjdvLn4",
      title: "Bill Clinton - Bob Dole (2/2)",
      primaryDate: new Date("1996-10-16"),
      primaryDateKind: "recorded"
    },
    {
      id: "ibcDfgiin2c",
      title: "George W. Bush - Al Gore (1/3)",
      primaryDate: new Date("2000-10-03"),
      primaryDateKind: "recorded"
    },
    {
      id: "zBXoItXHLTM",
      title: "George W. Bush - Al Gore (2/3)",
      primaryDate: new Date("2000-10-11"),
      primaryDateKind: "recorded"
    },
    {
      id: "qCIHimWyFb4",
      title: "George W. Bush - Al Gore (3/3)",
      primaryDate: new Date("2000-10-17"),
      primaryDateKind: "recorded"
    },
    {
      id: "1kW8_Qqff38",
      title: "George W. Bush - John Kerry (1/3)",
      primaryDate: new Date("2004-09-30"),
      primaryDateKind: "recorded"
    },
    {
      id: "21fXfTmv-aQ",
      title: "George W. Bush - John Kerry (2/3)",
      primaryDate: new Date("2004-10-08"),
      primaryDateKind: "recorded"
    },
    {
      id: "QcNLfajsA_M",
      title: "George W. Bush - John Kerry (3/3)",
      primaryDate: new Date("2004-10-13"),
      primaryDateKind: "recorded"
    },
    {
      id: "F-nNIEduEOw",
      title: "Barack Obama - John McCain (1/3)",
      primaryDate: new Date("2008-09-26"),
      primaryDateKind: "recorded"
    },
    {
      id: "VkBqLBsu-o4",
      title: "Barack Obama - John McCain (2/3)",
      primaryDate: new Date("2008-10-07"),
      primaryDateKind: "recorded"
    },
    {
      id: "DvdfO0lq4rQ",
      title: "Barack Obama - John McCain (3/3)",
      primaryDate: new Date("2008-10-13"),
      primaryDateKind: "recorded"
    },
    {
      id: "dkrwUU_YApE",
      title: "Barack Obama - Mitt Romney (1/3)",
      primaryDate: new Date("2012-10-03"),
      primaryDateKind: "recorded"
    },
    {
      id: "QEpCrcMF5Ps",
      title: "Barack Obama - Mitt Romney (2/3)",
      primaryDate: new Date("2012-10-16"),
      primaryDateKind: "recorded"
    },
    {
      id: "tecohezcA78",
      title: "Barack Obama - Mitt Romney (3/3)",
      primaryDate: new Date("2012-10-22"),
      primaryDateKind: "recorded"
    },
    {
      id: "NscjkqaJ8wI",
      title: "Donald Trump - Hillary Clinton (1/3)",
      primaryDate: new Date("2016-09-26"),
      primaryDateKind: "recorded"
    },
    {
      //id: "qkk1lrLQl9Q",  // Original video
      //id: "QuPWV36zqdc",  // Trimmed for dev work, with captions
      id: "ApTLB76Nmdg", // Full length with captions
      title: "Donald Trump - Hillary Clinton (2/3)",
      primaryDate: new Date("2016-10-09"),
      primaryDateKind: "recorded",
      captionFile: "trump-hillary-2.vtt",
      captionMeta: {
        speakers: [
          {
            firstname: "Martha",
            lastname: "Raddatz"
          },
          {
            firstname: "Anderson",
            lastname: "Cooper"
          },
          {
            firstname: "Patrice",
            lastname: "Brock"
          },
          {
            firstname: "Hillary",
            lastname: "Clinton"
          },
          {
            firstname: "Donald",
            lastname: "Trump"
          },
          {
            firstname: "Ken",
            lastname: "Karpowicz"
          },
          {
            firstname: "Gorbah",
            lastname: "Hameed"
          },
          {
            firstname: "Spencer",
            lastname: "Moss"
          },
          {
            firstname: "James",
            lastname: "Carter"
          },
          {
            firstname: "Beth",
            lastname: "Miller"
          },
          {
            firstname: "Ken",
            lastname: "Bone"
          },
          {
            firstname: "Karl",
            lastname: "Becker"
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
          },
          {
            speaker: "Raddatz",
            range: [90, 219]
          },
          {
            speaker: "Cooper",
            range: [221, 273]
          },
          {
            speaker: "Brock",
            range: [274, 317]
          },
          {
            speaker: "Clinton",
            range: [318, 645]
          },
          {
            speaker: "Cooper",
            range: [646, 655]
          },
          {
            speaker: "Trump",
            range: [656, 1019]
          },
          {
            speaker: "Cooper",
            range: [1020, 1094]
          },
          {
            speaker: "Trump",
            range: [1095, 1279]
          },
          {
            speaker: "Cooper",
            range: [1280, 1280]
          },
          {
            speaker: "Trump",
            range: [1281, 1308]
          },
          {
            speaker: "Cooper",
            range: [1309, 1340]
          },
          {
            speaker: "Trump",
            range: [1341, 1355]
          },
          {
            speaker: "Cooper",
            range: [1356, 1365]
          },
          {
            speaker: "Trump",
            range: [1366, 1390]
          },
          {
            speaker: "Cooper",
            range: [1391, 1396]
          },
          {
            speaker: "Trump",
            range: [1397, 1517]
          },
          {
            speaker: "Cooper",
            range: [1518, 1521]
          },
          {
            speaker: "Trump",
            range: [1522, 1529]
          },
          {
            speaker: "Cooper",
            range: [1530, 1536]
          },
          {
            speaker: "Clinton",
            range: [1537, 1896]
          },
          {
            speaker: "Raddatz",
            range: [1897, 1906]
          },
          {
            speaker: "Trump",
            range: [1907, 1918]
          },
          {
            speaker: "Raddatz",
            range: [1919, 1924]
          },
          {
            speaker: "Trump",
            range: [1925, 2061]
          },
          {
            speaker: "Raddatz",
            range: [2063, 2074]
          },
          {
            speaker: "Trump",
            range: [2075, 2086]
          },
          {
            speaker: "Raddatz",
            range: [2087, 2098]
          },
          {
            speaker: "Trump",
            range: [2099, 2102]
          },
          {
            speaker: "Raddatz",
            range: [2103, 2220]
          },
          {
            speaker: "Trump",
            range: [2221, 2496]
          },
          {
            speaker: "Raddatz",
            range: [2497, 2502]
          },
          {
            speaker: "Clinton",
            range: [2503, 2776]
          },
          {
            speaker: "Trump",
            range: [2777, 3246]
          },
          {
            speaker: "Clinton",
            range: [3247, 3365]
          },
          {
            speaker: "Trump",
            range: [3366, 3370]
          },
          {
            speaker: "Raddatz",
            range: [3371, 3372]
          },
          {
            speaker: "Cooper",
            range: [3373, 3392]
          },
          {
            speaker: "Raddatz",
            range: [3393, 3470]
          },
          {
            speaker: "Clinton",
            range: [3471, 3675]
          },
          {
            speaker: "Trump",
            range: [3676, 3909]
          },
          {
            speaker: "Cooper",
            range: [3910, 3923]
          },
          {
            speaker: "Clinton",
            range: [3924, 3931]
          },
          {
            speaker: "Trump",
            range: [3932, 3936]
          },
          {
            speaker: "Cooper",
            range: [3937, 3937]
          },
          {
            speaker: "Clinton",
            range: [3938, 3946]
          },
          {
            speaker: "Trump",
            range: [3947, 3948]
          },
          {
            speaker: "Cooper",
            range: [3949, 3959]
          },
          {
            speaker: "Clinton",
            range: [3960, 3993]
          },
          {
            speaker: "Trump",
            range: [3994, 3998]
          },
          {
            speaker: "Clinton",
            range: [3999, 4037]
          },
          {
            speaker: "Cooper",
            range: [4038, 4052]
          },
          {
            speaker: "Trump",
            range: [4053, 4087]
          },
          {
            speaker: "Cooper",
            range: [4088, 4092]
          },
          {
            speaker: "Trump",
            range: [4093, 4098]
          },
          {
            speaker: "Karpowicz",
            range: [4099, 4145]
          },
          {
            speaker: "Cooper",
            range: [4146, 4155]
          },
          {
            speaker: "Clinton",
            range: [4156, 4165]
          },
          {
            speaker: "Trump",
            range: [4166, 4172]
          },
          {
            speaker: "Cooper",
            range: [4173, 4174]
          },
          {
            speaker: "Clinton",
            range: [4175, 4541]
          },
          {
            speaker: "Cooper",
            range: [4542, 4547]
          },
          {
            speaker: "Trump",
            range: [4548, 4900]
          },
          {
            speaker: "Cooper",
            range: [4901, 4946]
          },
          {
            speaker: "Clinton",
            range: [4947, 5223]
          },
          {
            speaker: "Cooper",
            range: [5224, 5231]
          },
          {
            speaker: "Trump",
            range: [5232, 5262]
          },
          {
            speaker: "Cooper",
            range: [5262, 5315]
          },
          {
            speaker: "Trump",
            range: [5216, 5527]
          },
          {
            speaker: "Raddatz",
            range: [5528, 5539]
          },
          {
            speaker: "Hammeed",
            range: [5540, 5591]
          },
          {
            speaker: "Raddatz",
            range: [5592, 5595]
          },
          {
            speaker: "Trump",
            range: [5596, 5852]
          },
          {
            speaker: "Raddatz",
            range: [5853, 5854]
          },
          {
            speaker: "Clinton",
            range: [5855, 6181]
          },
          {
            speaker: "Raddatz",
            range: [6182, 6261]
          },
          {
            speaker: "Trump",
            range: [6262, 6255]
          },
          {
            speaker: "Raddatz",
            range: [6356, 6361]
          },
          {
            speaker: "Trump",
            range: [6362, 6368]
          },
          {
            speaker: "Raddatz",
            range: [6369, 6377]
          },
          {
            speaker: "Trump",
            range: [6378, 6560]
          },
          {
            speaker: "Raddatz",
            range: [6561, 6607]
          },
          {
            speaker: "Clinton",
            range: [6608, 6912]
          },
          {
            speaker: "Trump",
            range: [6913, 6947]
          },
          {
            speaker: "Raddatz",
            range: [6948, 6950]
          },
          {
            speaker: "Trump",
            range: [6951, 7168]
          },
          {
            speaker: "Raddatz",
            range: [7169, 7269]
          },
          {
            speaker: "Clinton",
            range: [7270, 7270]
          },
          {
            speaker: "Raddatz",
            range: [7271, 7273]
          },
          {
            speaker: "Clinton",
            range: [7274, 7577]
          },
          {
            speaker: "Raddatz",
            range: [7578, 7583]
          },
          {
            speaker: "Trump",
            range: [7584, 8008]
          },
          {
            speaker: "Raddatz",
            range: [8009, 8010]
          },
          {
            speaker: "Cooper",
            range: [8011, 8026]
          },
          {
            speaker: "Moss",
            range: [8027, 8049]
          },
          {
            speaker: "Cooper",
            range: [8050, 8055]
          },
          {
            speaker: "Trump",
            range: [8056, 8495]
          },
          {
            speaker: "Cooper",
            range: [8496, 8521]
          },
          {
            speaker: "Clinton",
            range: [8522, 8910]
          },
          {
            speaker: "Cooper",
            range: [8911, 9018]
          },
          {
            speaker: "Trump",
            range: [9019, 9214]
          },
          {
            speaker: "Cooper",
            range: [9215, 9230]
          },
          {
            speaker: "Trump",
            range: [9231, 9405]
          },
          {
            speaker: "Cooper",
            range: [9406, 9413]
          },
          {
            speaker: "Clinton",
            range: [9414, 9449]
          },
          {
            speaker: "Trump",
            range: [9450, 9455]
          },
          {
            speaker: "Clinton",
            range: [9456, 9471]
          },
          {
            speaker: "Trump",
            range: [9472, 9502]
          },
          {
            speaker: "Cooper",
            range: [9503, 9508]
          },
          {
            speaker: "Clinton",
            range: [9509, 9804]
          },
          {
            speaker: "Cooper",
            range: [9805, 9807]
          },
          {
            speaker: "Clinton",
            range: [9808, 9819]
          },
          {
            speaker: "Cooper",
            range: [9820, 9822]
          },
          {
            speaker: "Raddatz",
            range: [9823, 9835]
          },
          {
            speaker: "Trump",
            range: [9836, 9839]
          },
          {
            speaker: "Raddatz",
            range: [9840, 10007]
          },
          {
            speaker: "Clinton",
            range: [10008, 10321]
          },
          {
            speaker: "Raddatz",
            range: [10322, 10324]
          },
          {
            speaker: "Trump",
            range: [10325, 10338]
          },
          {
            speaker: "Clinton",
            range: [10339, 10348]
          },
          {
            speaker: "Trump",
            range: [10349, 10741]
          },
          {
            speaker: "Raddatz",
            range: [10742, 10826]
          },
          {
            speaker: "Trump",
            range: [10827, 11095]
          },
          {
            speaker: "Raddatz",
            range: [11096, 11104]
          },
          {
            speaker: "Trump",
            range: [11105, 11259]
          },
          {
            speaker: "Raddatz",
            range: [11260, 11320]
          },
          {
            speaker: "Clinton",
            range: [11321, 11409]
          },
          {
            speaker: "Raddatz",
            range: [11410, 11418]
          },
          {
            speaker: "Clinton",
            range: [11419, 11426]
          },
          {
            speaker: "Trump",
            range: [11427, 11427]
          },
          {
            speaker: "Clinton",
            range: [11428, 11626]
          },
          {
            speaker: "Raddatz",
            range: [11627, 11634]
          },
          {
            speaker: "Trump",
            range: [11635, 11657]
          },
          {
            speaker: "Cooper",
            range: [11658, 11665]
          },
          {
            speaker: "Carter",
            range: [11666, 11685]
          },
          {
            speaker: "Cooper",
            range: [11686, 11689]
          },
          {
            speaker: "Trump",
            range: [11690, 12078]
          },
          {
            speaker: "Cooper",
            range: [12079, 12084]
          },
          {
            speaker: "Trump",
            range: [12085, 12089]
          },
          {
            speaker: "Cooper",
            range: [12090, 12095]
          },
          {
            speaker: "Clinton",
            range: [12096, 12460]
          },
          {
            speaker: "Cooper",
            range: [12461, 12541]
          },
          {
            speaker: "Clinton",
            range: [12542, 12710]
          },
          {
            speaker: "Cooper",
            range: [12711, 12714]
          },
          {
            speaker: "Trump",
            range: [12715, 12843]
          },
          {
            speaker: "Cooper",
            range: [12844, 12928]
          },
          {
            speaker: "Trump",
            range: [12929, 13160]
          },
          {
            speaker: "Cooper",
            range: [13161, 13173]
          },
          {
            speaker: "Clinton",
            range: [13174, 13174]
          },
          {
            speaker: "Trump",
            range: [13175, 13179]
          },
          {
            speaker: "Clinton",
            range: [13180, 13345]
          },
          {
            speaker: "Cooper",
            range: [13346, 13350]
          },
          {
            speaker: "Clinton",
            range: [13351, 13390]
          },
          {
            speaker: "Raddatz",
            range: [13391, 13434]
          },
          {
            speaker: "Miller",
            range: [13435, 13464]
          },
          {
            speaker: "Raddatz",
            range: [13465, 13472]
          },
          {
            speaker: "Clinton",
            range: [13473, 13879]
          },
          {
            speaker: "Raddatz",
            range: [13880, 13887]
          },
          {
            speaker: "Trump",
            range: [13888, 14227]
          },
          {
            speaker: "Raddatz",
            range: [14228, 14241]
          },
          {
            speaker: "Clinton",
            range: [14242, 14284]
          },
          {
            speaker: "Cooper",
            range: [14285, 14309]
          },
          {
            speaker: "Bone",
            range: [14310, 14338]
          },
          {
            speaker: "Trump",
            range: [14339, 14677]
          },
          {
            speaker: "Cooper",
            range: [14678, 14679]
          },
          {
            speaker: "Clinton",
            range: [14680, 15068]
          },
          {
            speaker: "Raddatz",
            range: [15069, 15082]
          },
          {
            speaker: "Becker",
            range: [15083, 15108]
          },
          {
            speaker: "Raddatz",
            range: [15109, 15116]
          },
          {
            speaker: "Clinton",
            range: [15117, 15371]
          },
          {
            speaker: "Raddatz",
            range: [15372, 15373]
          },
          {
            speaker: "Trump",
            range: [15374, 15494]
          },
          {
            speaker: "Raddatz",
            range: [15495, 15499]
          },
          {
            speaker: "Cooper",
            range: [15500, 15534]
          },
          {
            speaker: "Raddatz",
            range: [15535, 15559]
          }
        ]
      }
    },
    {
      id: "fT0spjjJOK8",
      title: "Donald Trump - Hillary Clinton (3/3)",
      primaryDate: new Date("2016-10-16"),
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
          title: "Why it's so hard to have peace",
          titleSlug: "why-its-so-hard-to-have-peace",
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
              videoId: "QuPWV36zqdc",
              range: [304, 321]
            },
            {
              kind: "paragraph",
              text:
                "Thank goodness there's at least one party who is willing to give peace a chance!"
            },
            {
              kind: "video",
              videoId: "vIZ6w0kMqUA",
              range: [246, 261]
            },
            {
              kind: "paragraph",
              text: "Err..  Surely that's an outlier?"
            },
            {
              kind: "video",
              videoId: "vIZ6w0kMqUA",
              range: [190, 203]
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
              highlightedRange: [283, 439],
              viewRange: [283, 439]
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
              highlightedRange: [294, 368],
              viewRange: [283, 439]
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
          ],
          previewBlocks: [6, 11]
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
              highlightedRange: [17730, 18357],
              viewRange: [17730, 18357]
            },
            {
              kind: "paragraph",
              text:
                "Don’t bother reading the Constitution, it’s only for smart people like me. Trust me – the President is way out of line to think the Senate has any obligation to give his candidate a hearing!"
            }
          ],
          previewBlocks: [1, 0]
        }
      ]
    }
  ]
};

export default database;
