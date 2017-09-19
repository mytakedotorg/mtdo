import * as React from "react";
import * as ReactDOM from "react-dom";
import { getAllVideos, getAllDocumentExcerpts } from "../../utils/databaseAPI";
import { FoundationTextType } from "../Foundation";
import { slugify } from "../../utils/functions";
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
        <label>
          {item.content}
        </label>
      </div>
    );
  }
}

interface TimelineData {
  id: string;
  start: Date;
  content: string;
}

interface TimelineSelectEventHandlerProps {
  items: TimelineData["id"][];
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
  order?(a: TimelineData, b: TimelineData): number;
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
}

interface TimelineState {}

export default class Timeline extends React.Component<
  TimelineProps,
  TimelineState
> {
  private timeline: vis.Timeline;
  private timelineData: TimelineData[] = [];
  constructor(props: TimelineProps) {
    super(props);
  }
  initTimeline = () => {
    for (let video of getAllVideos()) {
      this.timelineData = [
        ...this.timelineData,
        {
          id: video.id,
          start: video.primaryDate,
          content: video.title
        }
      ];
    }

    for (let excerpt of getAllDocumentExcerpts()) {
      let idx = slugify(excerpt.title);
      this.timelineData = [
        ...this.timelineData,
        {
          id: idx,
          start: excerpt.primaryDate,
          content: excerpt.title
        }
      ];
    }

    let container = document.getElementById("mytimeline");
    let items: vis.DataSet<TimelineData> = new vis.DataSet(this.timelineData);
    let options: TimelineOptions = {
      orientation: "top",
      start: new Date(1770, 0, 1),
      end: new Date(),
      order: this.orderById,
      template: (item: TimelineData, element: HTMLElement) => {
        if (!item) {
          return;
        }
        ReactDOM.unmountComponentAtNode(element);
        return ReactDOM.render(<TimelineItem item={item} />, element);
      }
    };
    if (container) {
      this.timeline = new vis.Timeline(
        container,
        items,
        options as vis.TimelineOptions
      );
    }
  };
  orderById = (a: TimelineData, b: TimelineData): number => {
    if (a.id < b.id) {
      return -1;
    }
    return 1;
  };
  handleClick = (properties: TimelineSelectEventHandlerProps) => {
    let dataSetId = properties.items[0];
    if (dataSetId) {
      let dataItem = this.timelineData.filter((dataItem: any) => {
        return dataItem.id === dataSetId;
      })[0];
      this.props.onItemClick(dataItem.id);
    }
  };
  componentDidMount() {
    this.initTimeline();
    this.timeline.on("select", this.handleClick);
  }
  render() {
    return (
      <div>
        <h1>This is a Timeline</h1>
        <div id="mytimeline" />
      </div>
    );
  }
}
