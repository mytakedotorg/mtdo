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
}

interface TimelineRange {
  start: Date;
  end: Date;
}

export interface TimelineSelectEventHandlerProps {
  items: TimelineItemData["id"][];
  event: Event;
}

// More complete than vis.TimelineOptions
interface TimelineOptions {
  align?: string;
  autoResize?: boolean;
  clickToUse?: boolean;
  configure?: vis.TimelineOptionsConfigureType;
  dataAttributes?: vis.TimelineOptionsDataAttributesType;
  editable?: vis.TimelineOptionsEditableType;
  end?: vis.DateType;
  format?: any; // TODO
  groupEditable?: vis.TimelineOptionsGroupEditableType;
  groupOrder?: vis.TimelineOptionsGroupOrderType;
  groupOrderSwap?: vis.TimelineOptionsGroupOrderSwapFunction;
  groupTemplate?(item?: any, element?: any, data?: any): any;
  height?: vis.HeightWidthType;
  hiddenDates?: any; // TODO
  horizontalScroll?: boolean;
  itemsAlwaysDraggable?: boolean;
  locale?: string;
  locales?: any; // TODO
  moment?(): void; // TODO
  margin?: vis.TimelineOptionsMarginType;
  max?: vis.DateType;
  maxHeight?: vis.HeightWidthType;
  maxMinorChars?: number;
  min?: vis.DateType;
  minHeight?: vis.HeightWidthType;
  moveable?: boolean;
  multiselect?: boolean;
  multiselectPerGroup?: boolean;
  onAdd?(): void; // TODO
  onAddGroup?(): void; // TODO
  onUpdate?(): void; // TODO
  onMove?(): void; // TODO
  onMoveGroup?(): void; // TODO
  onMoving?(): void; // TODO
  onRemove?(): void; // TODO
  onRemoveGroup?(): void; // TODO
  order?(a: TimelineItemData, b: TimelineItemData): number;
  orientation?: vis.TimelineOptionsOrientationType;
  rollingMode?: any;
  selectable?: boolean;
  showCurrentTime?: boolean;
  showMajorLabels?: boolean;
  showMinorLabels?: boolean;
  stack?: boolean;
  snap?: vis.TimelineOptionsSnapFunction;
  start?: vis.DateType;
  template?(item?: any, element?: any, data?: any): any;
  throttleRedraw?: number;
  timeAxis?: vis.TimelineTimeAxisOption;
  type?: string;
  tooltipOnItemUpdateTime?: boolean | { template(item: any): any };
  verticalScroll?: boolean;
  width?: vis.HeightWidthType;
  zoomable?: boolean;
  zoomKey?: string;
  zoomMax?: number;
  zoomMin?: number;
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
    let options: TimelineOptions = {
      orientation: "top",
      start: range.start,
      end: range.end,
      order: this.orderBy,
      template: (item: TimelineItemData, element: HTMLElement) => {
        if (!item) {
          return;
        }
        ReactDOM.unmountComponentAtNode(element);
        return ReactDOM.render(<TimelineItem item={item} />, element);
      },
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
