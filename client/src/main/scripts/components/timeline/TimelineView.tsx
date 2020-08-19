/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
import React, { useState } from "react";
import {
  Corpus,
  PreviewSocial,
  TimelineSocial,
} from "../../common/social/social";
import { FT } from "../../java2ts/FT";
import Timeline, { TimelineItemData } from "./Timeline";
import { SetFactHandlers } from "./TimelinePreview";
import TimelinePreviewContainer from "./TimelinePreviewContainer";
import TimelineRadioButtons from "./TimelineRadioButtons";

interface URLValues {
  factTitleSlug: string;
  highlightedRange?: [number, number];
  viewRange?: [number, number];
}

interface TimelineViewProps {
  initialFact: TimelineSocial;
  factLinks: FT.FactLink[];
  setFactHandlers?: SetFactHandlers;
}

interface TimelineViewState {
  factLink: FT.FactLink | null;
  selectedOption: Corpus;
  timelineItems: TimelineItemData[];
  urlValues: URLValues | null;
  URLIsValid: boolean;
}

// function factToSelectedOption(
//   factLinks: FT.FactLink[],
//   social: TimelineSocial
// ): Corpus {
//   switch (social.kind) {
//     case "factUncut":
//     case "textCut":
//     case "videoCut":
//       switch (initialFactToSocial(social)?.kind) {
//         case "video":
//           return Corpus.Debates;
//         case "document":
//           return Corpus.Documents;
//         default:
//           return Corpus.Documents;
//       }
//     case "timeline":
//       return social.corpus;
//   }
// }

// function initialFactToSelectedFact(
//   factLinks: FT.FactLink[],
//   social: TimelineSocial
// ): FT.FactLink | null {
//   switch (social.kind) {
//     case "factUncut":
//     case "textCut":
//     case "videoCut":
//       return factLinks.find((fl) => fl.hash === social.fact)!;
//     case "timeline":
//       return null;
//   }
// }
function initialFactToSocial(social: TimelineSocial): PreviewSocial | null {
  switch (social.kind) {
    case "factUncut":
    case "textCut":
    case "videoCut":
      return social;
    case "timeline":
      return null;
  }
}
const TimelineView: React.FC<TimelineViewProps> = ({
  initialFact,
  factLinks,
  setFactHandlers,
}) => {
  const [selectedOption, setSelectedOption] = useState<Corpus>(Corpus.Debates);
  const [social, setSocial] = useState<PreviewSocial | null>(
    initialFactToSocial(initialFact)
  );
  const timelineItems = getTimelineItems(selectedOption, factLinks);

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = +ev.target.value as Corpus;
    if (value !== selectedOption) {
      setSelectedOption(value);
    }
  };

  const handleItemClick = (factHash: string) => {
    // for (let factLink of this.props.factLinks) {
    //   if (factLink.hash === factHash) {
    //     const factTitleSlug = slugify(factLink.fact.title);
    //     const stateObject: TimelineViewState = {
    //       ...this.state,
    //       factLink: factLink,
    //       urlValues: {
    //         factTitleSlug: factTitleSlug,
    //       },
    //     };
    //     if (this.props.path.startsWith(Routes.FOUNDATION)) {
    //       window.history.pushState(
    //         stateObject,
    //         "UnusedTitle",
    //         Routes.FOUNDATION + "/" + factTitleSlug
    //       );
    //     }
    //     this.setState({
    //       factLink: factLink,
    //       urlValues: {
    //         factTitleSlug: factTitleSlug,
    //       },
    //     });
    //   }
    // }
  };

  return (
    <div className={"timeline__view"}>
      <TimelineRadioButtons
        selectedOption={selectedOption}
        onChange={handleChange}
      />
      <Timeline
        onItemClick={handleItemClick}
        selectedOption={selectedOption}
        timelineItems={timelineItems}
      />
      {social && (
        <TimelinePreviewContainer
          social={social}
          setFactHandlers={setFactHandlers}
        />
      )}
    </div>
  );
};

function getTimelineItems(
  corpus: Corpus,
  factLinks: FT.FactLink[]
): TimelineItemData[] {
  const targetKindMap: Record<Corpus, string> = {
    [Corpus.Debates]: "video",
    [Corpus.Documents]: "document",
  };
  const targetKind = targetKindMap[corpus];

  return factLinks
    .filter((fl) => fl.fact.kind === targetKind)
    .map((fl) => ({
      id: fl.hash,
      idx: fl.hash,
      start: new Date(fl.fact.primaryDate),
      content: fl.fact.title,
      kind: fl.fact.kind,
    }));
}
export default TimelineView;

// class TimelineViewClass extends React.Component<
//   TimelineViewProps,
//   TimelineViewState
// > {
//   private updatingURL: boolean;
//   constructor(props: TimelineViewProps) {
//     super(props);

//     const urlValues = this.parseURL(props.path);

//     this.updatingURL = false;

//     this.state = {
//       factLink: null,
//       selectedOption: "Debates",
//       timelineItems: [],
//       urlValues: urlValues,
//       URLIsValid: urlValues === null ? true : false,
//     };
//   }
//   initializeTimeline = () => {
//     const { factLinks } = this.props;
//     let timelineItems: TimelineItemData[] = [];

//     let currentFactLink: FT.FactLink | null = null;
//     let URLIsValid = this.state.URLIsValid;
//     for (let factlink of factLinks) {
//       if (!URLIsValid) {
//         // Try to match the fact title from the hash with a valid title from the server
//         if (
//           this.state.urlValues &&
//           this.state.urlValues.factTitleSlug === slugify(factlink.fact.title)
//         ) {
//           currentFactLink = factlink;
//           URLIsValid = true;
//         }
//       }
//       let idx = factlink.hash;
//       timelineItems = [
//         ...timelineItems,
//         {
//           id: idx,
//           idx: idx,
//           start: new Date(factlink.fact.primaryDate),
//           content: factlink.fact.title,
//           kind: factlink.fact.kind,
//         },
//       ];
//     }
//     if (URLIsValid) {
//       const newStateObject = {
//         factLink: currentFactLink ? currentFactLink : null,
//         timelineItems: timelineItems,
//         URLIsValid: true,
//       };

//       this.setState({
//         ...newStateObject,
//       });
//     } else {
//       if (window.location.pathname.startsWith(Routes.FOUNDATION + "/")) {
//         window.location.href = Routes.FOUNDATION;
//       }
//     }
//   };

//   handleClick = (factHash: string) => {
//     for (let factLink of this.props.factLinks) {
//       if (factLink.hash === factHash) {
//         const factTitleSlug = slugify(factLink.fact.title);
//         const stateObject: TimelineViewState = {
//           ...this.state,
//           factLink: factLink,
//           urlValues: {
//             factTitleSlug: factTitleSlug,
//           },
//         };
//         if (this.props.path.startsWith(Routes.FOUNDATION)) {
//           window.history.pushState(
//             stateObject,
//             "UnusedTitle",
//             Routes.FOUNDATION + "/" + factTitleSlug
//           );
//         }
//         this.setState({
//           factLink: factLink,
//           urlValues: {
//             factTitleSlug: factTitleSlug,
//           },
//         });
//       }
//     }
//   };
//   handlePopState = (event: PopStateEvent) => {
//     if (event.state) {
//       // Back button was pressed, set state to popped state
//       this.setState({
//         ...event.state,
//       });
//     } else if (this.updatingURL) {
//       // Application is updating URL, state is ok, do nothing
//       this.updatingURL = false;
//     } else {
//       // Back button was pressed to get here but no state was pushed, reinitialize state
//       this.initializeTimeline();
//     }
//   };
//   handleRangeSet = (
//     highlightedRange: [number, number],
//     viewRange?: [number, number]
//   ) => {
//     if (this.props.path.startsWith(Routes.FOUNDATION)) {
//       const factLink = this.state.factLink;
//       if (factLink) {
//         const factTitleSlug = slugify(factLink.fact.title);

//         const oldURLValues = this.state.urlValues;

//         const stateObject: TimelineViewState = {
//           ...this.state,
//           urlValues: {
//             ...oldURLValues,
//             factTitleSlug: factTitleSlug,
//             highlightedRange: highlightedRange,
//             viewRange: viewRange,
//           },
//         };

//         let social: TimelineSocial;
//         if (!viewRange) {
//           // Video fact
//           social = {
//             cut: highlightedRange,
//             fact: factLink.hash,
//             kind: "videoCut",
//           };
//         } else {
//           // Document fact
//           social = {
//             cut: viewRange,
//             bold: [highlightedRange],
//             fact: factLink.hash,
//             kind: "textCut",
//           };
//         }
//         let newURL = `${Routes.FOUNDATION}/${factTitleSlug}/${encodeSocial(
//           social
//         )}`;

//         if (oldURLValues) {
//           this.setState({
//             urlValues: {
//               ...oldURLValues,
//               highlightedRange: highlightedRange,
//               viewRange: viewRange,
//             },
//           });

//           window.history.pushState(stateObject, "UnusedTitle", newURL);
//         } else {
//           throw "TimelineView: can't set a range when factLink is null (1)";
//         }
//       } else {
//         throw "TimelineView: can't set a range when factLink is null (2)";
//       }
//     }
//   };
//   handleRangeCleared = () => {
//     if (this.props.path.startsWith(Routes.FOUNDATION)) {
//       const factLink = this.state.factLink;
//       if (factLink) {
//         const factTitleSlug = slugify(factLink.fact.title);

//         const oldURLValues = this.state.urlValues;

//         const stateObject: TimelineViewState = {
//           ...this.state,
//           urlValues: {
//             ...oldURLValues,
//             factTitleSlug: factTitleSlug,
//             highlightedRange: undefined,
//             viewRange: undefined,
//           },
//         };

//         let newURL = `${Routes.FOUNDATION}/${factTitleSlug}`;
//         if (oldURLValues) {
//           this.setState({
//             urlValues: {
//               ...oldURLValues,
//               highlightedRange: undefined,
//               viewRange: undefined,
//             },
//           });
//           window.history.pushState(stateObject, "UnusedTitle", newURL);
//         } else {
//           throw "TimelineView: can't set a range when factLink is null (1)";
//         }
//       } else {
//         throw "TimelineView: can't clear a range when factLink is null";
//       }
//     }
//   };
//   handleDocumentSetClick = (
//     excerptHash: string,
//     highlightedRange: [number, number],
//     viewRange: [number, number]
//   ): void => {
//     window.location.href =
//       Routes.DRAFTS_NEW +
//       "/#" +
//       excerptHash +
//       "&" +
//       highlightedRange[0] +
//       "&" +
//       highlightedRange[1] +
//       "&" +
//       viewRange[0] +
//       "&" +
//       viewRange[1];
//   };
//   handleVideoSetClick = (
//     excerptTitle: string,
//     range: [number, number]
//   ): void => {
//     window.location.href =
//       Routes.DRAFTS_NEW + "/#" + excerptTitle + "&" + range[0] + "&" + range[1];
//   };
//   parseURL = (path: string): URLValues | null => {
//     let titleSlug: string | null;
//     let social: TimelineSocial | null;

//     const embedSlash = path.indexOf("/", Routes.FOUNDATION.length + 1);
//     let embed: TimelineSocial;
//     if (embedSlash == -1) {
//       titleSlug = path.substring(Routes.FOUNDATION.length + 1);
//       if (titleSlug === "") {
//         // trailing slash
//         titleSlug = null;
//       }
//       social = null;
//     } else {
//       titleSlug = path.substring(Routes.FOUNDATION.length + 1);
//       const embedRison = path.substring(embedSlash + 1);
//       if (embedRison === "") {
//         // trailing slash
//         social = null;
//       } else {
//         social = decodeSocial(embedRison);
//       }
//     }
//     if (!titleSlug) {
//       return null;
//     } else if (!social) {
//       return {
//         factTitleSlug: titleSlug,
//       };
//     } else {
//       /**
//        * @TODO https://github.com/mytakedotorg/mytakedotorg/issues/291
//        * Perhaps URLValues ought to replace highlightedRange/viewRange with TimelineSocial?
//        */
//       return {
//         factTitleSlug: titleSlug,
//         highlightedRange: (() => {
//           switch (social.kind) {
//             case "textCut":
//               return social.bold ? social.bold[0] : undefined;
//             case "videoCut":
//               return undefined;
//           }
//         })(),
//         viewRange: (() => {
//           switch (social.kind) {
//             case "textCut":
//               return social.cut;
//             case "videoCut":
//               return social.cut;
//           }
//         })(),
//       };
//     }
//   };
//   componentDidMount() {
//     this.initializeTimeline();
//     window.addEventListener("popstate", this.handlePopState);
//   }
//   componentWillUnmount() {
//     window.removeEventListener("popstate", this.handlePopState);
//   }
//   render() {
//     const { urlValues } = this.state;
//     let ranges;
//     if (urlValues && urlValues.highlightedRange) {
//       if (urlValues.viewRange) {
//         ranges = {
//           highlightedRange: urlValues.highlightedRange,
//           viewRange: urlValues.viewRange,
//         };
//       } else {
//         ranges = {
//           highlightedRange: urlValues.highlightedRange,
//         };
//       }
//     }
//     return (
//       <div className={"timeline__view"}>
//         {/* <TimelineRadioButtons
//           selectedOption={this.state.selectedOption}
//           onChange={this.handleChange}
//         /> */}
//         {this.state.timelineItems.length > 0 && (
//           <Timeline
//             onItemClick={this.handleClick}
//             selectedOption={this.state.selectedOption}
//             timelineItems={this.state.timelineItems}
//           />
//         )}
//         {/* {this.state.factLink ? (
//           <TimelinePreviewContainer
//             selectedFact={this.state.factLink}
//             setFactHandlers={this.props.setFactHandlers}
//             ranges={ranges}
//           />
//         ) : null} */}
//       </div>
//     );
//   }
// }
