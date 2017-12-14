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
import { slugify } from "../utils/functions";

interface HashValues {
  factTitleSlug: string;
  articleUser: string;
  articleTitle: string;
  highlightedRange: [number, number];
  viewRange: [number, number];
  offset: number;
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
            window.location.hash = "";
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
          factLink: factLink
        });
      }
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
    const articleUser = hashArr[1].split("/")[1];
    const articleTitle = hashArr[1].split("/")[2];
    const highlightedRange: [number, number] = [
      parseInt(hashArr[2]),
      parseInt(hashArr[3])
    ];
    const viewRange: [number, number] = [
      parseInt(hashArr[4]),
      parseInt(hashArr[5])
    ];
    const offset = parseInt(hashArr[6]);

    return {
      factTitleSlug,
      articleUser,
      articleTitle,
      highlightedRange,
      viewRange,
      offset
    };
  };
  componentDidMount() {
    this.getTimelineItems();
  }
  render() {
    const setFactHandlers: SetFactHandlers = this.props.setFactHandlers
      ? this.props.setFactHandlers
      : {
          handleDocumentSetClick: this.handleDocumentSetClick,
          handleVideoSetClick: this.handleVideoSetClick
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

export const TimelineViewBranch: React.StatelessComponent<
  TimelineViewBranchProps
> = props => {
  if (
    props.containerState.hashIsValid &&
    props.containerState.hashValues &&
    props.containerState.factLink
  ) {
    const ranges = {
      highlightedRange: props.containerState.hashValues.highlightedRange,
      viewRange: props.containerState.hashValues.viewRange
    };
    return (
      <div className={"timeline__view"}>
        <TimelinePreviewContainer
          factLink={props.containerState.factLink}
          setFactHandlers={props.setFactHandlers}
          ranges={ranges}
          offset={props.containerState.hashValues.offset}
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
};
