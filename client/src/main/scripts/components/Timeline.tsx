import * as React from "react";
import * as ReactDOM from "react-dom";
import * as vis from "vis";

interface TimelineItemProps {
  item: vis.DataItem;
}

class TimelineItem extends React.Component<TimelineItemProps, {}> {
  constructor(props: TimelineItemProps) {
    super(props);
  }
  render() {
    var { item } = this.props;
    return (
      <div className="timeline__item">
        <label>{item.content}</label>
      </div>
    );
  }
}

export interface TimelineItemData {
  id: string;
  idx: string;
  start: Date;
  content: string;
  kind: string;
  element?: HTMLElement;
}

interface TimelineRange {
  start: Date;
  end: Date;
}

export interface TimelineSelectEventHandlerProps {
  items: TimelineItemData["id"][];
  event: Event;
}

interface TimelineProps {
  onItemClick: (excerptId: string) => void;
  selectedOption: "Debates" | "Documents";
  timelineItems: TimelineItemData[];
}

interface TimelineState {}

export default class Timeline extends React.Component<
  TimelineProps,
  TimelineState
> {
  private timeline: vis.Timeline;
  constructor(props: TimelineProps) {
    super(props);
  }
  initTimeline = () => {
    let container = document.getElementById("mytimeline");
    let range = this.getTimelineRange();
    let options: vis.TimelineOptions = {
      orientation: "top",
      start: range.start,
      end: range.end,
      order: this.orderBy,
      template: this.itemTemplate,
      zoomable: false
    };
    if (container) {
      this.timeline = new vis.Timeline(
        container,
        new vis.DataSet(this.props.timelineItems.filter(this.filterTimeline)),
        options as vis.TimelineOptions
      );
      this.timeline.on("select", this.handleClick);
    }
  };
  orderBy = (a: TimelineItemData, b: TimelineItemData): number => {
    if (a.start < b.start) {
      return -1;
    }
    return 1;
  };
  filterTimeline = (timelineItem: TimelineItemData) => {
    return (
      (this.props.selectedOption === "Debates" &&
        timelineItem.kind === "video") ||
      (this.props.selectedOption === "Documents" &&
        timelineItem.kind === "document")
    );
  };
  getTimelineRange = (): TimelineRange => {
    let start: Date = new Date();
    let end: Date = new Date();

    let width = document.body.getBoundingClientRect().width;

    if (this.props.selectedOption === "Debates") {
      if (width < 480) {
        start = new Date(2013, 0, 1);
      } else if (width < 768) {
        start = new Date(2011, 0, 1);
      } else if (width < 1020) {
        start = new Date(2003, 0, 1);
      } else {
        start = new Date(2000, 0, 1);
      }
      end = new Date(2021, 0, 1);
    }

    if (this.props.selectedOption === "Documents") {
      start = new Date(1770, 0, 1);
      end = new Date();
    }

    return {
      start: start,
      end: end
    };
  };
  handleClick = (properties: TimelineSelectEventHandlerProps) => {
    let dataSetId = properties.items[0];
    this.props.onItemClick(dataSetId);
  };
  componentDidMount() {
    this.initTimeline();
    window.onresize = this.updateRange.bind(this);
    window.addEventListener("orientationchange", this.updateRange.bind(this));
  }
  componentDidUpdate(prevProps: TimelineProps, prevState: TimelineState) {
    if (this.props.selectedOption !== prevProps.selectedOption) {
      this.updateTimeline();
    }
  }
  componentWillUnMount() {
    (this.timeline.off as any)("select", this.handleClick); //Issue with vis tyings here.
    window.removeEventListener("orientationchange", this.updateRange);
  }

  itemTemplate = (item: TimelineItemData, element: HTMLElement): string => {
    // https://github.com/almende/vis/issues/3592#issuecomment-359105752
    if (item != null && item.content != null && item.element != undefined) {
      return "";
    }
    if (item.content == null) {
      ReactDOM.unmountComponentAtNode(element);
      const component = <TimelineItem item={item} />;

      ReactDOM.render(component, element, () => {
        this.timeline.redraw();
      });
      item.element = element;
    }
    return item.content;
  };

  updateRange() {
    let range = this.getTimelineRange();
    this.timeline.setOptions({
      start: range.start,
      end: range.end
    });
  }
  updateTimeline() {
    this.updateRange();
    this.timeline.setItems(
      this.props.timelineItems.filter(this.filterTimeline)
    );
  }
  render() {
    return <div id="mytimeline" />;
  }
}
