import * as React from "react";
import { getAllVideoFacts, getAllDocumentFacts } from "../../utils/databaseAPI";
import { slugify } from "../../utils/functions";
import Timeline, {
  TimelineItemData,
  TimelineSelectEventHandlerProps
} from "../Timeline";
import TimelineLoadingView from "../TimelineLoadingView";

interface TimelineContainerProps {
  onItemClick: (excerptId: string) => void;
}

interface TimelineContainerState {
  loading: boolean;
  selectedOption: "Debates" | "Documents";
  timelineItems: TimelineItemData[];
}

export default class TimelineContainer extends React.Component<
  TimelineContainerProps,
  TimelineContainerState
> {
  constructor(props: TimelineContainerProps) {
    super(props);

    this.state = {
      loading: true,
      selectedOption: "Documents",
      timelineItems: []
    };
  }
  getTimelineItems = () => {
    let timelineItems: TimelineItemData[] = [];

    if (this.state.selectedOption === "Debates") {
      throw "TODO";
      // for (let video of getAllVideoFacts()) {
      //   let idx = slugify(video.title);
      //   timelineItems = [
      //     ...timelineItems,
      //     {
      //       id: video.id,
      //       idx: idx,
      //       start: video.primaryDate,
      //       content: video.title
      //     }
      //   ];
      // }
    }

    if (this.state.selectedOption === "Documents") {
      for (let fact of getAllDocumentFacts()) {
        let idx = slugify(fact.title);
        timelineItems = [
          ...timelineItems,
          {
            id: idx,
            idx: idx,
            start: new Date(fact.primaryDate),
            content: fact.title
          }
        ];
      }
    }
    setTimeout(() => {
      this.setState({
        loading: false,
        timelineItems: timelineItems
      });
    }, 2000);
  };
  handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value = ev.target.value;
    if (value === "Debates" || value === "Documents") {
      if (value !== this.state.selectedOption) {
        this.setState({
          loading: true,
          selectedOption: value
        });
      }
    }
  };
  handleClick = (excerptId: string) => {
    this.props.onItemClick(excerptId);
  };
  componentDidMount() {
    this.getTimelineItems();
  }
  componentDidUpdate(
    prevProps: TimelineContainerProps,
    prevState: TimelineContainerState
  ) {
    if (this.state.selectedOption !== prevState.selectedOption) {
      this.getTimelineItems();
    }
  }
  render() {
    return (
      <div className={"timeline"}>
        <div className="timeline__inner-container">
          <div className="timeline__actions">
            <input
              type="radio"
              id="radio--debates"
              className="timeline__radio"
              name="type"
              value="Debates"
              onChange={this.handleChange}
              checked={this.state.selectedOption === "Debates"}
            />
            <label htmlFor="radio--debates" className="timeline__radio-label">
              Debates
            </label>
            <input
              type="radio"
              id="radio--documents"
              className="timeline__radio"
              name="type"
              value="Documents"
              onChange={this.handleChange}
              checked={this.state.selectedOption === "Documents"}
            />
            <label htmlFor="radio--documents" className="timeline__radio-label">
              Founding Documents
            </label>
          </div>
        </div>
        {this.state.loading
          ? <TimelineLoadingView />
          : <Timeline
              onItemClick={this.handleClick}
              selectedOption={this.state.selectedOption}
              timelineItems={this.state.timelineItems}
            />}
      </div>
    );
  }
}
