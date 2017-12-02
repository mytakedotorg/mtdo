import * as React from "react";
import * as ReactDOM from "react-dom";
import Timeline, { TimelineItemData } from "../Timeline";
import TimelineLoadingView from "../TimelineLoadingView";
import TimelineErrorView from "../TimelineErrorView";
import TimelinePreviewContainer from "../TimelinePreviewContainer";
import TimelineRadioButtons from "./TimelineRadioButtons";
import { SetFactHandlers } from "../TimelinePreview";
import { getAllFacts } from "../../utils/databaseAPI";
import { Foundation } from "../../java2ts/Foundation";
import { Routes } from "../../java2ts/Routes";
import { slugify } from "../../utils/functions";

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

interface TimelineViewState {
  error: boolean;
  factLink: Foundation.FactLink | null;
  loading: boolean;
  selectedOption: SelectionOptions;
  timelineItems: TimelineItemData[];
  hashValues: HashValues | null;
}

export default class TimelineView extends React.Component<
  TimelineViewProps,
  TimelineViewState
> {
  private factLinks: Foundation.FactLink[] = [];
  private hashIsValid: boolean;
  constructor(props: TimelineViewProps) {
    super(props);

    this.hashIsValid = props.hashUrl ? false : true;

    this.state = {
      error: false,
      factLink: null,
      loading: true,
      selectedOption: "Debates",
      timelineItems: [],
      hashValues: props.hashUrl ? this.parseHashURL(props.hashUrl) : null
    };
  }
  getTimelineItems = () => {
    let timelineItems: TimelineItemData[] = [];
    getAllFacts(
      (error: string | Error | null, factlinks: Foundation.FactLink[]) => {
        if (error) {
          this.setState({
            loading: false,
            error: true
          });
        } else {
          let currentFactLink: Foundation.FactLink | null = null;
          for (let factlink of factlinks) {
            if (!this.hashIsValid) {
              // Try to find the match the fact title from the hash with a valid title from the server
              if (
                this.state.hashValues &&
                this.state.hashValues.factTitleSlug ===
                  slugify(factlink.fact.title)
              ) {
                currentFactLink = factlink;
                this.hashIsValid = true;
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
          if (this.hashIsValid) {
            this.factLinks = factlinks;
            this.setState({
              loading: false,
              factLink: currentFactLink ? currentFactLink : null,
              timelineItems: timelineItems
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
    if (this.hashIsValid && this.state.hashValues && this.state.factLink) {
      const ranges = {
        highlightedRange: this.state.hashValues.highlightedRange,
        viewRange: this.state.hashValues.viewRange
      };
      return (
        <div className={"timeline__view"}>
          <TimelinePreviewContainer
            factLink={this.state.factLink}
            setFactHandlers={setFactHandlers}
            ranges={ranges}
            offset={this.state.hashValues.offset}
          />
          <div className="editor__wrapper">
            <p className="timeline__instructions">
              Explore other Facts in the timeline below.
            </p>
          </div>
          <div className={"timeline"}>
            {this.state.error
              ? <TimelineErrorView />
              : this.state.loading
                ? <TimelineLoadingView />
                : <div>
                    <TimelineRadioButtons
                      selectedOption={this.state.selectedOption}
                      onChange={this.handleChange}
                    />
                    <Timeline
                      onItemClick={this.handleClick}
                      selectedOption={this.state.selectedOption}
                      timelineItems={this.state.timelineItems}
                    />
                  </div>}
          </div>
        </div>
      );
    } else {
      return (
        <div className={"timeline__view"}>
          {this.state.error
            ? <TimelineErrorView />
            : this.state.loading
              ? <TimelineLoadingView />
              : <div>
                  <TimelineRadioButtons
                    selectedOption={this.state.selectedOption}
                    onChange={this.handleChange}
                  />
                  <Timeline
                    onItemClick={this.handleClick}
                    selectedOption={this.state.selectedOption}
                    timelineItems={this.state.timelineItems}
                  />
                </div>}
          {this.state.factLink
            ? <TimelinePreviewContainer
                factLink={this.state.factLink}
                setFactHandlers={setFactHandlers}
              />
            : null}
        </div>
      );
    }
  }
}
