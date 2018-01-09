import * as React from "react";
import * as ReactDOM from "react-dom";
import Timeline, { TimelineItemData } from "./Timeline";
import TimelineLoadingView from "./TimelineLoadingView";
import TimelinePreviewContainer from "./TimelinePreviewContainer";
import TimelineRadioButtons from "./TimelineRadioButtons";
import { SetFactHandlers } from "./TimelinePreview";
import { getAllFacts } from "../utils/databaseAPI";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { alertErr, slugify } from "../utils/functions";

interface URLValues {
  factTitleSlug: string;
  articleUser?: string;
  articleTitle?: string;
  highlightedRange?: [number, number];
  viewRange?: [number, number];
  offset?: number;
}

export type SelectionOptions = "Debates" | "Documents";

interface TimelineViewProps {
  path: string;
  hashUrl?: string;
  setFactHandlers?: SetFactHandlers;
}

export interface TimelineViewState {
  factLink: Foundation.FactLink | null;
  loading: boolean;
  selectedOption: SelectionOptions;
  timelineItems: TimelineItemData[];
  urlValues: URLValues | null;
  URLIsValid: boolean;
}

export default class TimelineView extends React.Component<
  TimelineViewProps,
  TimelineViewState
> {
  private factLinks: Foundation.FactLink[] = [];
  private updatingURL: boolean;
  constructor(props: TimelineViewProps) {
    super(props);

    const urlValues = this.parseURL(props.path, props.hashUrl);

    this.updatingURL = false;

    this.state = {
      factLink: null,
      loading: true,
      selectedOption: "Debates",
      timelineItems: [],
      urlValues: urlValues,
      URLIsValid: urlValues === null ? true : false
    };
  }
  initializeTimeline = (
    error: string | Error | null,
    factlinks: Foundation.FactLink[]
  ) => {
    let timelineItems: TimelineItemData[] = [];
    if (error) {
      if (typeof error != "string") {
        alertErr("TimelineView: " + error.message);
      } else {
        alertErr("TimelineView: " + error);
      }
      throw error;
    } else {
      let currentFactLink: Foundation.FactLink | null = null;
      let URLIsValid = this.state.URLIsValid;
      for (let factlink of factlinks) {
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
            kind: factlink.fact.kind
          }
        ];
      }
      if (URLIsValid) {
        this.factLinks = factlinks;
        const newStateObject = {
          loading: false,
          factLink: currentFactLink ? currentFactLink : null,
          timelineItems: timelineItems,
          URLIsValid: true
        };

        this.setState({
          ...newStateObject
        });
      } else {
        if (window.location.pathname.startsWith(Routes.FOUNDATION + "/")) {
          window.location.href = Routes.FOUNDATION;
        }
      }
    }
  };
  getTimelineItems = () => {
    getAllFacts(this.initializeTimeline);
  };
  handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    if (value === "Debates" || value === "Documents") {
      if (value !== this.state.selectedOption) {
        this.setState({
          selectedOption: value
        });
      }
    }
  };
  handleClick = (factHash: string) => {
    for (let factLink of this.factLinks) {
      if (factLink.hash === factHash) {
        const factTitleSlug = slugify(factLink.fact.title);
        const stateObject: TimelineViewState = {
          ...this.state,
          factLink: factLink,
          urlValues: {
            factTitleSlug: factTitleSlug
          }
        };
        if (this.props.path.startsWith("/foundation")) {
          window.history.pushState(
            stateObject,
            "UnusedTitle",
            Routes.FOUNDATION + "/" + factTitleSlug
          );
        }
        this.setState({
          factLink: factLink,
          urlValues: {
            factTitleSlug: factTitleSlug
          }
        });
      }
    }
  };
  handlePopState = (event: PopStateEvent) => {
    if (event.state) {
      // Back button was pressed, set state to popped state
      this.setState({
        ...event.state
      });
    } else if (this.updatingURL) {
      // Application is updating URL, state is ok, do nothing
      this.updatingURL = false;
    } else {
      // Back button was pressed to get here but no state was pushed, reinitialize state
      this.initializeTimeline(null, this.factLinks);
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
            viewRange: viewRange
          }
        };

        let newURL =
          Routes.FOUNDATION +
          "/" +
          factTitleSlug +
          "/" +
          highlightedRange[0].toString() +
          "-" +
          highlightedRange[1].toString();
        if (viewRange) {
          newURL +=
            "/" + viewRange[0].toString() + "-" + viewRange[1].toString();
        }

        if (oldURLValues) {
          this.setState({
            urlValues: {
              ...oldURLValues,
              highlightedRange: highlightedRange,
              viewRange: viewRange
            }
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
            viewRange: undefined
          }
        };

        let newURL = Routes.FOUNDATION + "/" + factTitleSlug;

        if (oldURLValues) {
          this.setState({
            urlValues: {
              ...oldURLValues,
              highlightedRange: undefined,
              viewRange: undefined
            }
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
    let endOfUrl: string;
    if (this.state.urlValues) {
      endOfUrl =
        "&" +
        "/" +
        this.state.urlValues.articleUser +
        "/" +
        this.state.urlValues.articleTitle;
    } else {
      endOfUrl = "";
    }
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
      viewRange[1] +
      endOfUrl;
  };
  handleVideoSetClick = (
    excerptTitle: string,
    range: [number, number]
  ): void => {
    let endOfUrl: string;
    if (this.state.urlValues) {
      endOfUrl =
        "&" +
        "/" +
        this.state.urlValues.articleUser +
        "/" +
        this.state.urlValues.articleTitle;
    } else {
      endOfUrl = "";
    }
    window.location.href =
      Routes.DRAFTS_NEW +
      "/#" +
      excerptTitle +
      "&" +
      range[0] +
      "&" +
      range[1] +
      endOfUrl;
  };
  parseURL = (path: string, hash?: string): URLValues | null => {
    const pathArr = path.substring(1).split("/");
    if (pathArr.length > 1) {
      if (Routes.FOUNDATION.indexOf(pathArr[0]) !== -1) {
        const factTitleSlug = pathArr[1];
        let articleUser;
        let articleTitle;
        let highlightedRange: [number, number] | undefined;
        let viewRange: [number, number] | undefined;
        let offset;
        if (pathArr[2] && pathArr[2].indexOf("-") !== -1) {
          highlightedRange = [
            parseFloat(pathArr[2].split("-")[0]),
            parseFloat(pathArr[2].split("-")[1])
          ];
          if (pathArr[3] && pathArr[3].indexOf("-") !== -1) {
            viewRange = [
              parseInt(pathArr[3].split("-")[0]),
              parseInt(pathArr[3].split("-")[1])
            ];
            if (pathArr[6]) {
              offset = parseFloat(pathArr[6]);
            }
          } else if (pathArr[3]) {
            offset = parseFloat(pathArr[3]);
          }
        }
        if (hash) {
          const hashArr = hash.split("/");
          if (hashArr[0] && hashArr[1]) {
            articleUser = hashArr[0];
            articleTitle = hashArr[1];
          }
        }
        return {
          factTitleSlug: factTitleSlug,
          articleUser: articleUser,
          articleTitle: articleTitle,
          highlightedRange: highlightedRange,
          viewRange: viewRange,
          offset
        };
      } else {
        //route not /foundation
        return null;
      }
    } else {
      return null;
    }
  };
  componentDidMount() {
    this.getTimelineItems();
    window.addEventListener("popstate", this.handlePopState);
  }
  componentWillUnmount() {
    window.removeEventListener("popstate", this.handlePopState);
  }
  render() {
    const setFactHandlers: SetFactHandlers = this.props.setFactHandlers
      ? {
          ...this.props.setFactHandlers
        }
      : {
          handleDocumentSetClick: this.handleDocumentSetClick,
          handleVideoSetClick: this.handleVideoSetClick,
          handleRangeSet: this.handleRangeSet,
          handleRangeCleared: this.handleRangeCleared
        };
    const eventHandlers: EventHandlers = {
      handleChange: this.handleChange,
      handleClick: this.handleClick
    };
    return (
      <TimelineViewBranch
        containerState={this.state}
        setFactHandlers={setFactHandlers}
        eventHandlers={eventHandlers}
      />
    );
  }
}

export interface EventHandlers {
  handleChange: (ev: React.ChangeEvent<HTMLInputElement>) => any;
  handleClick: (excerptId: string) => void;
}

interface TimelineViewBranchProps {
  containerState: TimelineViewState;
  setFactHandlers: SetFactHandlers;
  eventHandlers: EventHandlers;
}

interface TimelineViewBranchState {
  isInverted: boolean;
}

export class TimelineViewBranch extends React.Component<
  TimelineViewBranchProps,
  TimelineViewBranchState
> {
  constructor(props: TimelineViewBranchProps) {
    super(props);

    let isInverted;
    if (props.containerState.urlValues) {
      isInverted = true;
    } else {
      isInverted = false;
    }

    this.state = {
      isInverted: isInverted
    };
  }
  render() {
    const { props } = this;
    if (this.state.isInverted && props.containerState.factLink) {
      let ranges;
      let offset;
      if (
        props.containerState.urlValues &&
        props.containerState.urlValues.highlightedRange
      ) {
        if (props.containerState.urlValues.viewRange) {
          ranges = {
            highlightedRange: props.containerState.urlValues.highlightedRange,
            viewRange: props.containerState.urlValues.viewRange
          };
          if (props.containerState.urlValues.offset) {
            offset = props.containerState.urlValues.offset;
          }
        } else {
          ranges = {
            highlightedRange: props.containerState.urlValues.highlightedRange
          };
        }
      }

      return (
        <div className={"timeline__view"}>
          <TimelinePreviewContainer
            factLink={props.containerState.factLink}
            setFactHandlers={props.setFactHandlers}
            ranges={ranges}
            offset={offset}
          />
          <div className="editor__wrapper">
            <p className="timeline__instructions">
              Explore other Facts in the timeline below.
            </p>
          </div>
          <div className={"timeline"}>
            {props.containerState.loading ? (
              <TimelineLoadingView />
            ) : (
              <div>
                <TimelineRadioButtons
                  selectedOption={props.containerState.selectedOption}
                  onChange={props.eventHandlers.handleChange}
                />
                <Timeline
                  onItemClick={props.eventHandlers.handleClick}
                  selectedOption={props.containerState.selectedOption}
                  timelineItems={props.containerState.timelineItems}
                />
              </div>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className={"timeline__view"}>
          {props.containerState.loading ? (
            <TimelineLoadingView />
          ) : (
            <div>
              <TimelineRadioButtons
                selectedOption={props.containerState.selectedOption}
                onChange={props.eventHandlers.handleChange}
              />
              <Timeline
                onItemClick={props.eventHandlers.handleClick}
                selectedOption={props.containerState.selectedOption}
                timelineItems={props.containerState.timelineItems}
              />
            </div>
          )}
          {props.containerState.factLink ? (
            <TimelinePreviewContainer
              factLink={props.containerState.factLink}
              setFactHandlers={props.setFactHandlers}
            />
          ) : null}
        </div>
      );
    }
  }
}
