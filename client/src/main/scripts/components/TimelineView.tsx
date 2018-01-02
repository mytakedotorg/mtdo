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

interface HashValues {
  factTitleSlug: string;
  articleUser?: string;
  articleTitle?: string;
  highlightedRange?: [number, number];
  viewRange?: [number, number];
  offset?: number;
}

export type SelectionOptions = "Debates" | "Documents";

interface TimelineViewProps {
  hashUrl?: string;
  setFactHandlers?: SetFactHandlers;
}

export interface TimelineViewState {
  factLink: Foundation.FactLink | null;
  loading: boolean;
  selectedOption: SelectionOptions;
  timelineItems: TimelineItemData[];
  hashValues: HashValues | null;
  hashIsValid: boolean;
}

export default class TimelineView extends React.Component<
  TimelineViewProps,
  TimelineViewState
> {
  private factLinks: Foundation.FactLink[] = [];
  private hashIsValid: boolean;
  constructor(props: TimelineViewProps) {
    super(props);

    this.state = {
      factLink: null,
      loading: true,
      selectedOption: "Debates",
      timelineItems: [],
      hashValues: props.hashUrl ? this.parseHashURL(props.hashUrl) : null,
      hashIsValid: props.hashUrl ? false : true
    };
  }
  getTimelineItems = () => {
    let timelineItems: TimelineItemData[] = [];
    getAllFacts(
      (error: string | Error | null, factlinks: Foundation.FactLink[]) => {
        if (error) {
          if (typeof error != "string") {
            alertErr("TimelineView: " + error.message);
          } else {
            alertErr("TimelineView: " + error);
          }
          throw error;
        } else {
          let currentFactLink: Foundation.FactLink | null = null;
          let hashIsValid = this.state.hashIsValid;
          for (let factlink of factlinks) {
            if (!hashIsValid) {
              // Try to match the fact title from the hash with a valid title from the server
              if (
                this.state.hashValues &&
                this.state.hashValues.factTitleSlug ===
                  slugify(factlink.fact.title)
              ) {
                currentFactLink = factlink;
                hashIsValid = true;
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
          if (hashIsValid) {
            this.factLinks = factlinks;
            this.setState({
              loading: false,
              factLink: currentFactLink ? currentFactLink : null,
              timelineItems: timelineItems,
              hashIsValid: true
            });
          } else {
            window.location.href = Routes.FOUNDATION;
          }
        }
      }
    );
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
        this.setState({
          factLink: factLink,
          hashValues: null
        });
        window.location.hash = slugify(factLink.fact.title);
      }
    }
  };
  handleRangeSet = (
    highlightedRange: [number, number],
    viewRange?: [number, number]
  ) => {
    if (this.state.factLink) {
      let newHash =
        slugify(this.state.factLink.fact.title) +
        "&" +
        highlightedRange[0].toString() +
        "&" +
        highlightedRange[1].toString();
      if (viewRange) {
        newHash +=
          "&" + viewRange[0].toString() + "&" + viewRange[1].toString();
      }
      window.location.hash = newHash;
    } else {
      const msg = "TimelineView: can't set a range when factLink is null";
      alertErr(msg);
      throw msg;
    }
  };
  handleRangeCleared = () => {
    if (this.state.factLink) {
      window.location.hash = slugify(this.state.factLink.fact.title);
    } else {
      const msg = "TimelineView: can't clear a range when factLink is null";
      alertErr(msg);
      throw msg;
    }
  };
  handleDocumentSetClick = (
    excerptHash: string,
    highlightedRange: [number, number],
    viewRange: [number, number]
  ): void => {
    let endOfUrl: string;
    if (this.state.hashValues) {
      endOfUrl =
        "&" +
        "/" +
        this.state.hashValues.articleUser +
        "/" +
        this.state.hashValues.articleTitle;
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
    if (this.state.hashValues) {
      endOfUrl =
        "&" +
        "/" +
        this.state.hashValues.articleUser +
        "/" +
        this.state.hashValues.articleTitle;
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
  parseHashURL = (hash: string): HashValues => {
    const hashArr = hash.substring(1).split("&");
    const factTitleSlug = hashArr[0];

    let articleUser;
    let articleTitle;
    let highlightedRange: [number, number] | undefined;
    let viewRange: [number, number] | undefined;
    let offset;

    if (hashArr[1]) {
      if (
        hashArr[1].charAt(0) === "(" &&
        hashArr[1].charAt(hashArr[1].length - 1) === ")"
      ) {
        // Wrapped in parentheses, so username/article-title is present
        articleUser = hashArr[1].split("/")[1];
        articleTitle = hashArr[1].split("/")[2];
        if (hashArr[2] && hashArr[3]) {
          highlightedRange = [parseFloat(hashArr[2]), parseFloat(hashArr[3])];
          if (hashArr[4] && hashArr[5]) {
            viewRange = [parseInt(hashArr[4]), parseInt(hashArr[5])];
            if (hashArr[6]) {
              offset = parseFloat(hashArr[6]);
            }
          }
        }
      } else {
        // No username/article-title to reference
        if (hashArr[2]) {
          highlightedRange = [parseFloat(hashArr[1]), parseFloat(hashArr[2])];
          if (hashArr[3] && hashArr[4]) {
            viewRange = [parseInt(hashArr[3]), parseInt(hashArr[4])];
            if (hashArr[5]) {
              offset = parseFloat(hashArr[5]);
            }
          }
        }
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
  };
  componentDidMount() {
    this.getTimelineItems();
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
    if (props.containerState.hashValues) {
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
        props.containerState.hashValues &&
        props.containerState.hashValues.highlightedRange
      ) {
        if (props.containerState.hashValues.viewRange) {
          ranges = {
            highlightedRange: props.containerState.hashValues.highlightedRange,
            viewRange: props.containerState.hashValues.viewRange
          };
          if (props.containerState.hashValues.offset) {
            offset = props.containerState.hashValues.offset;
          }
        } else {
          ranges = {
            highlightedRange: props.containerState.hashValues.highlightedRange
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
