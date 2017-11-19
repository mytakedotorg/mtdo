import { TakeBlock } from "../ts2java/api";

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
  timestamp: number;
}

interface Person {
  firstname: string;
  middlename?: string;
  lastname: string;
}

export interface SpeakerMap {
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
            range: [293, 416]
          },
          {
            speaker: "Carter",
            range: [417, 849]
          },
          {
            speaker: "Frederick",
            range: [850, 856]
          },
          {
            speaker: "Ford",
            range: [857, 1148]
          },
          {
            speaker: "Frederick",
            range: [1149, 1155]
          },
          {
            speaker: "Trewhitt",
            range: [1156, 1265]
          },
          {
            speaker: "Ford",
            range: [1266, 1700]
          },
          {
            speaker: "Carter",
            range: [1701, 2014]
          },
          {
            speaker: "Frederick",
            range: [2015, 2021]
          },
          {
            speaker: "Valeriani",
            range: [2022, 2128]
          },
          {
            speaker: "Carter",
            range: [2129, 2619]
          },
          {
            speaker: "Valeriani",
            range: [2620, 2641]
          },
          {
            speaker: "Carter",
            range: [2642, 2896]
          },
          {
            speaker: "Frederick",
            range: [2897, 2903]
          },
          {
            speaker: "Ford",
            range: [2904, 3187]
          },
          {
            speaker: "Frederick",
            range: [3188, 3194]
          },
          {
            speaker: "Frankel",
            range: [3195, 3343]
          },
          {
            speaker: "Ford",
            range: [3344, 3734]
          },
          {
            speaker: "Frankel",
            range: [3735, 3808]
          },
          {
            speaker: "Ford",
            range: [3809, 3925]
          },
          {
            speaker: "Frederick",
            range: [3926, 3932]
          },
          {
            speaker: "Carter",
            range: [3933, 4294]
          },
          {
            speaker: "Frederick",
            range: [4295, 4301]
          },
          {
            speaker: "Trewhitt",
            range: [4302, 4414]
          },
          {
            speaker: "Carter",
            range: [4415, 4933]
          },
          {
            speaker: "Trewhitt",
            range: [4934, 4996]
          },
          {
            speaker: "Carter",
            range: [4997, 5079]
          },
          {
            speaker: "Frederick",
            range: [5080, 5081]
          },
          {
            speaker: "Ford",
            range: [5082, 5348]
          },
          {
            speaker: "Frederick",
            range: [5349, 5355]
          },
          {
            speaker: "Valeriani",
            range: [5356, 5434]
          },
          {
            speaker: "Ford",
            range: [5435, 5639]
          },
          {
            speaker: "Valeriani",
            range: [5640, 5648]
          },
          {
            speaker: "Ford",
            range: [5649, 5708]
          },
          {
            speaker: "Frederick",
            range: [5709, 5710]
          },
          {
            speaker: "Carter",
            range: [5711, 5951]
          },
          {
            speaker: "Frederick",
            range: [5952, 5958]
          },
          {
            speaker: "Frankel",
            range: [5959, 6067]
          },
          {
            speaker: "Carter",
            range: [6068, 6531]
          },
          {
            speaker: "Frankel",
            range: [6532, 6596]
          },
          {
            speaker: "Carter",
            range: [6597, 6761]
          },
          {
            speaker: "Frederick",
            range: [6762, 6763]
          },
          {
            speaker: "Ford",
            range: [6764, 7041]
          },
          {
            speaker: "Frederick",
            range: [7042, 7048]
          },
          {
            speaker: "Trewhitt",
            range: [7049, 7161]
          },
          {
            speaker: "Ford",
            range: [7162, 7522]
          },
          {
            speaker: "Trewhitt",
            range: [7523, 7627]
          },
          {
            speaker: "Ford",
            range: [7628, 7797]
          },
          {
            speaker: "Frederick",
            range: [7798, 7799]
          },
          {
            speaker: "Carter",
            range: [7800, 8127]
          },
          {
            speaker: "Frederick",
            range: [8128, 8134]
          },
          {
            speaker: "Valeriani",
            range: [8135, 8195]
          },
          {
            speaker: "Carter",
            range: [8196, 8532]
          },
          {
            speaker: "Frederick",
            range: [8533, 8534]
          },
          {
            speaker: "Ford",
            range: [8535, 8795]
          },
          {
            speaker: "Frederick",
            range: [8796, 8802]
          },
          {
            speaker: "Frankel",
            range: [8803, 9040]
          },
          {
            speaker: "Ford",
            range: [9041, 9444]
          },
          {
            speaker: "Frankel",
            range: [9445, 9508]
          },
          {
            speaker: "Ford",
            range: [9509, 9774]
          },
          {
            speaker: "Frederick",
            range: [9775, 9776]
          },
          {
            speaker: "Carter",
            range: [9777, 10118]
          },
          {
            speaker: "Frederick",
            range: [10119, 10180]
          },
          {
            speaker: "Trewhitt",
            range: [10181, 10235]
          },
          {
            speaker: "Carter",
            range: [10236, 10441]
          },
          {
            speaker: "Frederick",
            range: [10442, 10443]
          },
          {
            speaker: "Ford",
            range: [10444, 10578]
          },
          {
            speaker: "Frederick",
            range: [10579, 10585]
          },
          {
            speaker: "Valeriani",
            range: [10586, 10648]
          },
          {
            speaker: "Ford",
            range: [10649, 10944]
          },
          {
            speaker: "Frederick",
            range: [10945, 10946]
          },
          {
            speaker: "Carter",
            range: [10947, 11209]
          },
          {
            speaker: "Frederick",
            range: [11210, 11229]
          },
          {
            speaker: "Frankel",
            range: [11230, 11257]
          },
          {
            speaker: "Carter",
            range: [11258, 11461]
          },
          {
            speaker: "Frederick",
            range: [11462, 11463]
          },
          {
            speaker: "Ford",
            range: [11464, 11714]
          },
          {
            speaker: "Frederick",
            range: [11715, 11723]
          },
          {
            speaker: "Trewhitt",
            range: [11724, 11760]
          },
          {
            speaker: "Ford",
            range: [11761, 11844]
          },
          {
            speaker: "Frederick",
            range: [11845, 11846]
          },
          {
            speaker: "Carter",
            range: [11847, 12034]
          },
          {
            speaker: "Frederick",
            range: [12035, 12085]
          },
          {
            speaker: "Carter",
            range: [12086, 12554]
          },
          {
            speaker: "Frederick",
            range: [12555, 12556]
          },
          {
            speaker: "Ford",
            range: [12557, 12671]
          },
          {
            speaker: "Frederick",
            range: [12672, 12780]
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
            lastname: "Hamed"
          },
          {
            firstname: "Spencer",
            lastname: "Maass"
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
            range: [220, 273]
          },
          {
            speaker: "Brock",
            range: [274, 317]
          },
          {
            speaker: "Clinton",
            range: [318, 646]
          },
          {
            speaker: "Cooper",
            range: [647, 656]
          },
          {
            speaker: "Trump",
            range: [657, 1013]
          },
          {
            speaker: "Cooper",
            range: [1014, 1088]
          },
          {
            speaker: "Trump",
            range: [1089, 1301]
          },
          {
            speaker: "Cooper",
            range: [1302, 1333]
          },
          {
            speaker: "Trump",
            range: [1334, 1348]
          },
          {
            speaker: "Cooper",
            range: [1349, 1358]
          },
          {
            speaker: "Trump",
            range: [1359, 1382]
          },
          {
            speaker: "Cooper",
            range: [1383, 1388]
          },
          {
            speaker: "Trump",
            range: [1389, 1509]
          },
          {
            speaker: "Cooper",
            range: [1510, 1513]
          },
          {
            speaker: "Trump",
            range: [1514, 1521]
          },
          {
            speaker: "Cooper",
            range: [1522, 1528]
          },
          {
            speaker: "Clinton",
            range: [1529, 1889]
          },
          {
            speaker: "Raddatz",
            range: [1890, 1899]
          },
          {
            speaker: "Trump",
            range: [1900, 1911]
          },
          {
            speaker: "Raddatz",
            range: [1912, 1917]
          },
          {
            speaker: "Trump",
            range: [1918, 2051]
          },
          {
            speaker: "Raddatz",
            range: [2052, 2064]
          },
          {
            speaker: "Trump",
            range: [2065, 2076]
          },
          {
            speaker: "Raddatz",
            range: [2077, 2089]
          },
          {
            speaker: "Trump",
            range: [2090, 2093]
          },
          {
            speaker: "Raddatz",
            range: [2094, 2211]
          },
          {
            speaker: "Trump",
            range: [2212, 2484]
          },
          {
            speaker: "Raddatz",
            range: [2485, 2490]
          },
          {
            speaker: "Clinton",
            range: [2491, 2764]
          },
          {
            speaker: "Trump",
            range: [2765, 3238]
          },
          {
            speaker: "Clinton",
            range: [3239, 3360]
          },
          {
            speaker: "Trump",
            range: [3361, 3365]
          },
          {
            speaker: "Raddatz",
            range: [3366, 3367]
          },
          {
            speaker: "Cooper",
            range: [3368, 3387]
          },
          {
            speaker: "Raddatz",
            range: [3388, 3461]
          },
          {
            speaker: "Clinton",
            range: [3462, 3670]
          },
          {
            speaker: "Trump",
            range: [3671, 3921]
          },
          {
            speaker: "Cooper",
            range: [3922, 3936]
          },
          {
            speaker: "Clinton",
            range: [3937, 3946]
          },
          {
            speaker: "Trump",
            range: [3947, 3951]
          },
          {
            speaker: "Clinton",
            range: [3952, 3963]
          },
          {
            speaker: "Trump",
            range: [3964, 3965]
          },
          {
            speaker: "Cooper",
            range: [3966, 3976]
          },
          {
            speaker: "Clinton",
            range: [3977, 4010]
          },
          {
            speaker: "Trump",
            range: [4011, 4015]
          },
          {
            speaker: "Clinton",
            range: [4016, 4063]
          },
          {
            speaker: "Cooper",
            range: [4064, 4079]
          },
          {
            speaker: "Trump",
            range: [4080, 4098]
          },
          {
            speaker: "Cooper",
            range: [4099, 4103]
          },
          {
            speaker: "Trump",
            range: [4104, 4115]
          },
          {
            speaker: "Cooper",
            range: [4116, 4120]
          },
          {
            speaker: "Trump",
            range: [4121, 4127]
          },
          {
            speaker: "Karpowicz",
            range: [4128, 4174]
          },
          {
            speaker: "Cooper",
            range: [4175, 4184]
          },
          {
            speaker: "Clinton",
            range: [4185, 4194]
          },
          {
            speaker: "Trump",
            range: [4195, 4201]
          },
          {
            speaker: "Cooper",
            range: [4202, 4203]
          },
          {
            speaker: "Clinton",
            range: [4204, 4568]
          },
          {
            speaker: "Cooper",
            range: [4569, 4574]
          },
          {
            speaker: "Trump",
            range: [4575, 4930]
          },
          {
            speaker: "Cooper",
            range: [4931, 4976]
          },
          {
            speaker: "Clinton",
            range: [4977, 5247]
          },
          {
            speaker: "Cooper",
            range: [5248, 5255]
          },
          {
            speaker: "Trump",
            range: [5256, 5293]
          },
          {
            speaker: "Cooper",
            range: [5294, 5340]
          },
          {
            speaker: "Trump",
            range: [5341, 5344]
          },
          {
            speaker: "Cooper",
            range: [5345, 5348]
          },
          {
            speaker: "Trump",
            range: [5349, 5391]
          },
          {
            speaker: "Cooper",
            range: [5392, 5405]
          },
          {
            speaker: "Trump",
            range: [5406, 5577]
          },
          {
            speaker: "Raddatz",
            range: [5578, 5589]
          },
          {
            speaker: "Hamed",
            range: [5590, 5641]
          },
          {
            speaker: "Raddatz",
            range: [5642, 5645]
          },
          {
            speaker: "Trump",
            range: [5646, 5904]
          },
          {
            speaker: "Raddatz",
            range: [5905, 5906]
          },
          {
            speaker: "Clinton",
            range: [5907, 6232]
          },
          {
            speaker: "Raddatz",
            range: [6233, 6312]
          },
          {
            speaker: "Trump",
            range: [6313, 6397]
          },
          {
            speaker: "Raddatz",
            range: [6398, 6427]
          },
          {
            speaker: "Trump",
            range: [6428, 6602]
          },
          {
            speaker: "Raddatz",
            range: [6603, 6647]
          },
          {
            speaker: "Clinton",
            range: [6648, 6956]
          },
          {
            speaker: "Trump",
            range: [6957, 6992]
          },
          {
            speaker: "Raddatz",
            range: [6993, 6995]
          },
          {
            speaker: "Trump",
            range: [6996, 7215]
          },
          {
            speaker: "Raddatz",
            range: [7216, 7321]
          },
          {
            speaker: "Clinton",
            range: [7322, 7634]
          },
          {
            speaker: "Trump",
            range: [7635, 8078]
          },
          {
            speaker: "Cooper",
            range: [8079, 8096]
          },
          {
            speaker: "Maass",
            range: [8097, 8119]
          },
          {
            speaker: "Cooper",
            range: [8120, 8125]
          },
          {
            speaker: "Trump",
            range: [8126, 8566]
          },
          {
            speaker: "Cooper",
            range: [8567, 8593]
          },
          {
            speaker: "Clinton",
            range: [8594, 8981]
          },
          {
            speaker: "Cooper",
            range: [8982, 9095]
          },
          {
            speaker: "Trump",
            range: [9096, 9293]
          },
          {
            speaker: "Cooper",
            range: [9294, 9309]
          },
          {
            speaker: "Trump",
            range: [9310, 9405]
          },
          {
            speaker: "Cooper",
            range: [9406, 9408]
          },
          {
            speaker: "Trump",
            range: [9409, 9482]
          },
          {
            speaker: "Cooper",
            range: [9483, 9492]
          },
          {
            speaker: "Clinton",
            range: [9493, 9524]
          },
          {
            speaker: "Trump",
            range: [9525, 9534]
          },
          {
            speaker: "Clinton",
            range: [9535, 9543]
          },
          {
            speaker: "Trump",
            range: [9544, 9545]
          },
          {
            speaker: "Clinton",
            range: [9546, 9556]
          },
          {
            speaker: "Trump",
            range: [9557, 9591]
          },
          {
            speaker: "Cooper",
            range: [9592, 9595]
          },
          {
            speaker: "Clinton",
            range: [9596, 9891]
          },
          {
            speaker: "Cooper",
            range: [9892, 9894]
          },
          {
            speaker: "Clinton",
            range: [9895, 9908]
          },
          {
            speaker: "Raddatz",
            range: [9909, 10085]
          },
          {
            speaker: "Clinton",
            range: [10086, 10401]
          },
          {
            speaker: "Raddatz",
            range: [10402, 10404]
          },
          {
            speaker: "Trump",
            range: [10405, 10419]
          },
          {
            speaker: "Clinton",
            range: [10420, 10430]
          },
          {
            speaker: "Trump",
            range: [10431, 10821]
          },
          {
            speaker: "Raddatz",
            range: [10822, 10906]
          },
          {
            speaker: "Trump",
            range: [10907, 10917]
          },
          {
            speaker: "Raddatz",
            range: [10918, 10923]
          },
          {
            speaker: "Trump",
            range: [10924, 11023]
          },
          {
            speaker: "Raddatz",
            range: [11024, 11032]
          },
          {
            speaker: "Trump",
            range: [11033, 11201]
          },
          {
            speaker: "Raddatz",
            range: [11202, 11211]
          },
          {
            speaker: "Trump",
            range: [11212, 11216]
          },
          {
            speaker: "Raddatz",
            range: [11217, 11224]
          },
          {
            speaker: "Trump",
            range: [11225, 11389]
          },
          {
            speaker: "Raddatz",
            range: [11390, 11450]
          },
          {
            speaker: "Clinton",
            range: [11451, 11536]
          },
          {
            speaker: "Raddatz",
            range: [11537, 11547]
          },
          {
            speaker: "Clinton",
            range: [11548, 11554]
          },
          {
            speaker: "Trump",
            range: [11555, 11555]
          },
          {
            speaker: "Clinton",
            range: [11556, 11756]
          },
          {
            speaker: "Raddatz",
            range: [11757, 11764]
          },
          {
            speaker: "Cooper",
            range: [11765, 11775]
          },
          {
            speaker: "Carter",
            range: [11776, 11795]
          },
          {
            speaker: "Cooper",
            range: [11796, 11797]
          },
          {
            speaker: "Trump",
            range: [11798, 12149]
          },
          {
            speaker: "Cooper",
            range: [12150, 12153]
          },
          {
            speaker: "Trump",
            range: [12154, 12185]
          },
          {
            speaker: "Cooper",
            range: [12186, 12192]
          },
          {
            speaker: "Trump",
            range: [12193, 12198]
          },
          {
            speaker: "Cooper",
            range: [12199, 12204]
          },
          {
            speaker: "Clinton",
            range: [12205, 12572]
          },
          {
            speaker: "Cooper",
            range: [12573, 12650]
          },
          {
            speaker: "Clinton",
            range: [12651, 12819]
          },
          {
            speaker: "Cooper",
            range: [12820, 12828]
          },
          {
            speaker: "Trump",
            range: [12829, 12932]
          },
          {
            speaker: "Cooper",
            range: [12933, 12939]
          },
          {
            speaker: "Trump",
            range: [12940, 12961]
          },
          {
            speaker: "Cooper",
            range: [12962, 13046]
          },
          {
            speaker: "Trump",
            range: [13047, 13078]
          },
          {
            speaker: "Cooper",
            range: [13079, 13082]
          },
          {
            speaker: "Trump",
            range: [13083, 13124]
          },
          {
            speaker: "Cooper",
            range: [13125, 13132]
          },
          {
            speaker: "Trump",
            range: [13133, 13294]
          },
          {
            speaker: "Cooper",
            range: [13295, 13307]
          },
          {
            speaker: "Clinton",
            range: [13308, 13308]
          },
          {
            speaker: "Trump",
            range: [13309, 13313]
          },
          {
            speaker: "Clinton",
            range: [13314, 13474]
          },
          {
            speaker: "Cooper",
            range: [13475, 13479]
          },
          {
            speaker: "Clinton",
            range: [13480, 13523]
          },
          {
            speaker: "Raddatz",
            range: [13524, 13554]
          },
          {
            speaker: "Miller",
            range: [13555, 13584]
          },
          {
            speaker: "Raddatz",
            range: [13585, 13592]
          },
          {
            speaker: "Clinton",
            range: [13593, 13999]
          },
          {
            speaker: "Raddatz",
            range: [14000, 14007]
          },
          {
            speaker: "Trump",
            range: [14008, 14338]
          },
          {
            speaker: "Raddatz",
            range: [14339, 14350]
          },
          {
            speaker: "Clinton",
            range: [14351, 14400]
          },
          {
            speaker: "Cooper",
            range: [14401, 14412]
          },
          {
            speaker: "Bone",
            range: [14413, 14441]
          },
          {
            speaker: "Cooper",
            range: [14442, 14445]
          },
          {
            speaker: "Trump",
            range: [14446, 14773]
          },
          {
            speaker: "Cooper",
            range: [14774, 14777]
          },
          {
            speaker: "Trump",
            range: [14778, 14782]
          },
          {
            speaker: "Cooper",
            range: [14783, 14784]
          },
          {
            speaker: "Clinton",
            range: [14785, 15173]
          },
          {
            speaker: "Raddatz",
            range: [15174, 15185]
          },
          {
            speaker: "Becker",
            range: [15186, 15211]
          },
          {
            speaker: "Raddatz",
            range: [15212, 15219]
          },
          {
            speaker: "Clinton",
            range: [15220, 15476]
          },
          {
            speaker: "Raddatz",
            range: [15477, 15478]
          },
          {
            speaker: "Trump",
            range: [15479, 15600]
          },
          {
            speaker: "Raddatz",
            range: [15601, 15605]
          },
          {
            speaker: "Cooper",
            range: [15606, 15639]
          },
          {
            speaker: "Raddatz",
            range: [15640, 15664]
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
              videoId: "ApTLB76Nmdg",
              range: [304, 321]
            },
            {
              kind: "paragraph",
              text:
                "Thank goodness there's at least one party who is willing to give peace a chance!"
            },
            {
              kind: "video",
              videoId: "GX1kHw2tmtI",
              range: [246, 261]
            },
            {
              kind: "paragraph",
              text: "Err..  Surely that's an outlier?"
            },
            {
              kind: "video",
              videoId: "GX1kHw2tmtI",
              range: [190, 202.5]
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
