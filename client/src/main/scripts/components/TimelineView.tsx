/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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
import * as React from "react";
import Timeline, { TimelineItemData } from "./Timeline";
import TimelinePreviewContainer from "./TimelinePreviewContainer";
import TimelineRadioButtons from "./TimelineRadioButtons";
import { SetFactHandlers } from "./TimelinePreview";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { alertErr, slugify } from "../utils/functions";

interface URLValues {
  factTitleSlug: string;
  highlightedRange?: [number, number];
  viewRange?: [number, number];
}

export type SelectionOptions = "Debates" | "Documents";

interface TimelineViewProps {
  factLinks: Foundation.FactLink[];
  path: string;
  setFactHandlers?: SetFactHandlers;
}

export interface TimelineViewState {
  factLink: Foundation.FactLink | null;
  selectedOption: SelectionOptions;
  timelineItems: TimelineItemData[];
  urlValues: URLValues | null;
  URLIsValid: boolean;
}

export default class TimelineView extends React.Component<
  TimelineViewProps,
  TimelineViewState
> {
  private updatingURL: boolean;
  constructor(props: TimelineViewProps) {
    super(props);

    const urlValues = this.parseURL(props.path);

    this.updatingURL = false;

    this.state = {
      factLink: null,
      selectedOption: "Debates",
      timelineItems: [],
      urlValues: urlValues,
      URLIsValid: urlValues === null ? true : false,
    };
  }
  initializeTimeline = () => {
    const { factLinks } = this.props;
    let timelineItems: TimelineItemData[] = [];

    let currentFactLink: Foundation.FactLink | null = null;
    let URLIsValid = this.state.URLIsValid;
    for (let factlink of factLinks) {
      if (!URLIsValid) {
        // Try to match the fact title from the hash with a valid title from the server
        if (
          this.state.urlValues &&
          this.state.urlValues.factTitleSlug === slugify(factlink.fact.title)
        ) {
          currentFactLink = factlink;
          URLIsValid = true;
        }
      }
      let idx = factlink.hash;
      timelineItems = [
        ...timelineItems,
        {
          id: idx,
          idx: idx,
          start: new Date(factlink.fact.primaryDate),
          content: factlink.fact.title,
          kind: factlink.fact.kind,
        },
      ];
    }
    if (URLIsValid) {
      const newStateObject = {
        factLink: currentFactLink ? currentFactLink : null,
        timelineItems: timelineItems,
        URLIsValid: true,
      };

      this.setState({
        ...newStateObject,
      });
    } else {
      if (window.location.pathname.startsWith(Routes.FOUNDATION + "/")) {
        window.location.href = Routes.FOUNDATION;
      }
    }
  };
  handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    if (value === "Debates" || value === "Documents") {
      if (value !== this.state.selectedOption) {
        this.setState({
          selectedOption: value,
        });
      }
    }
  };
  handleClick = (factHash: string) => {
    for (let factLink of this.props.factLinks) {
      if (factLink.hash === factHash) {
        const factTitleSlug = slugify(factLink.fact.title);
        const stateObject: TimelineViewState = {
          ...this.state,
          factLink: factLink,
          urlValues: {
            factTitleSlug: factTitleSlug,
          },
        };
        if (this.props.path.startsWith(Routes.FOUNDATION)) {
          window.history.pushState(
            stateObject,
            "UnusedTitle",
            Routes.FOUNDATION_V1 + "/" + factTitleSlug
          );
        }
        this.setState({
          factLink: factLink,
          urlValues: {
            factTitleSlug: factTitleSlug,
          },
        });
      }
    }
  };
  handlePopState = (event: PopStateEvent) => {
    if (event.state) {
      // Back button was pressed, set state to popped state
      this.setState({
        ...event.state,
      });
    } else if (this.updatingURL) {
      // Application is updating URL, state is ok, do nothing
      this.updatingURL = false;
    } else {
      // Back button was pressed to get here but no state was pushed, reinitialize state
      this.initializeTimeline();
    }
  };
  handleRangeSet = (
    highlightedRange: [number, number],
    viewRange?: [number, number]
  ) => {
    if (this.props.path.startsWith(Routes.FOUNDATION)) {
      const factLink = this.state.factLink;
      if (factLink) {
        const factTitleSlug = slugify(factLink.fact.title);

        const oldURLValues = this.state.urlValues;

        const stateObject: TimelineViewState = {
          ...this.state,
          urlValues: {
            ...oldURLValues,
            factTitleSlug: factTitleSlug,
            highlightedRange: highlightedRange,
            viewRange: viewRange,
          },
        };

        let newURL = Routes.FOUNDATION_V1 + "/" + factTitleSlug + "/";

        if (!viewRange) {
          // Video fact
          newURL +=
            highlightedRange[0].toFixed(3) +
            "-" +
            highlightedRange[1].toFixed(3);
        } else {
          // Document fact
          newURL +=
            highlightedRange[0].toString() +
            "-" +
            highlightedRange[1].toString() +
            "/" +
            viewRange[0].toString() +
            "-" +
            viewRange[1].toString();
        }

        if (oldURLValues) {
          this.setState({
            urlValues: {
              ...oldURLValues,
              highlightedRange: highlightedRange,
              viewRange: viewRange,
            },
          });

          window.history.pushState(stateObject, "UnusedTitle", newURL);
        } else {
          const msg =
            "TimelineView: can't set a range when factLink is null (1)";
          alertErr(msg);
          throw msg;
        }
      } else {
        const msg = "TimelineView: can't set a range when factLink is null (2)";
        alertErr(msg);
        throw msg;
      }
    }
  };
  handleRangeCleared = () => {
    if (this.props.path.startsWith(Routes.FOUNDATION)) {
      const factLink = this.state.factLink;
      if (factLink) {
        const factTitleSlug = slugify(factLink.fact.title);

        const oldURLValues = this.state.urlValues;

        const stateObject: TimelineViewState = {
          ...this.state,
          urlValues: {
            ...oldURLValues,
            factTitleSlug: factTitleSlug,
            highlightedRange: undefined,
            viewRange: undefined,
          },
        };

        let newURL = Routes.FOUNDATION_V1 + "/" + factTitleSlug;

        if (oldURLValues) {
          this.setState({
            urlValues: {
              ...oldURLValues,
              highlightedRange: undefined,
              viewRange: undefined,
            },
          });

          window.history.pushState(stateObject, "UnusedTitle", newURL);
        } else {
          const msg =
            "TimelineView: can't set a range when factLink is null (1)";
          alertErr(msg);
          throw msg;
        }
      } else {
        const msg = "TimelineView: can't clear a range when factLink is null";
        alertErr(msg);
        throw msg;
      }
    }
  };
  handleDocumentSetClick = (
    excerptHash: string,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ): void => {
    window.location.href =
      Routes.DRAFTS_NEW +
      "/#" +
      excerptHash +
      "&" +
      highlightedRange[0] +
      "&" +
      highlightedRange[1] +
      "&" +
      viewRange[0] +
      "&" +
      viewRange[1];
  };
  handleVideoSetClick = (
    excerptTitle: string,
    range: [number, number]
  ): void => {
    window.location.href =
      Routes.DRAFTS_NEW + "/#" + excerptTitle + "&" + range[0] + "&" + range[1];
  };
  parseURL = (path: string): URLValues | null => {
    /**
     * @TODO https://github.com/mytakedotorg/mytakedotorg/issues/291
     */
    const pathArr = path.substring(1).split("/");
    if (pathArr.length > 1) {
      if (Routes.FOUNDATION_V1.indexOf(pathArr[0]) !== -1) {
        const factTitleSlug = pathArr[1];
        let highlightedRange: [number, number] | undefined;
        let viewRange: [number, number] | undefined;
        if (pathArr[2] && pathArr[2].indexOf("-") !== -1) {
          highlightedRange = [
            parseFloat(pathArr[2].split("-")[0]),
            parseFloat(pathArr[2].split("-")[1]),
          ];
          if (pathArr[3] && pathArr[3].indexOf("-") !== -1) {
            viewRange = [
              parseInt(pathArr[3].split("-")[0]),
              parseInt(pathArr[3].split("-")[1]),
            ];
          }
        }
        return {
          factTitleSlug: factTitleSlug,
          highlightedRange: highlightedRange,
          viewRange: viewRange,
        };
      } else {
        //route not /foundation-v1
        return null;
      }
    } else {
      return null;
    }
  };
  componentDidMount() {
    this.initializeTimeline();
    window.addEventListener("popstate", this.handlePopState);
  }
  componentWillUnmount() {
    window.removeEventListener("popstate", this.handlePopState);
  }
  render() {
    const { urlValues } = this.state;
    let ranges;
    if (urlValues && urlValues.highlightedRange) {
      if (urlValues.viewRange) {
        ranges = {
          highlightedRange: urlValues.highlightedRange,
          viewRange: urlValues.viewRange,
        };
      } else {
        ranges = {
          highlightedRange: urlValues.highlightedRange,
        };
      }
    }
    return (
      <div className={"timeline__view"}>
        <TimelineRadioButtons
          selectedOption={this.state.selectedOption}
          onChange={this.handleChange}
        />
        {this.state.timelineItems.length > 0 && (
          <Timeline
            onItemClick={this.handleClick}
            selectedOption={this.state.selectedOption}
            timelineItems={this.state.timelineItems}
          />
        )}
        {this.state.factLink ? (
          <TimelinePreviewContainer
            factLink={this.state.factLink}
            setFactHandlers={this.props.setFactHandlers}
            ranges={ranges}
          />
        ) : null}
      </div>
    );
  }
}
