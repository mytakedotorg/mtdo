import * as React from "react";
import * as ReactDOM from "react-dom";
import database from "../../utils/database";
import { FoundationTextType } from "../Foundation";

//import vis from "vis";
let vis = require("vis");

interface VisDataItem {
  id: number;
  content: string;
  start: string;
  end?: string;
}

let dataset: any = [];
let idx = 0;

database.videos.map(video => {
  dataset = [
    ...dataset,
    {
      idx: idx++,
      id: video.id,
      title: video.title,
      start: video.date,
      content: video.title
    }
  ];
});

database.excerpts.map(excerpt => {
  dataset = [
    ...dataset,
    {
      idx: idx++,
      start: excerpt.date,
      content: excerpt.title,
      document: excerpt.document,
      range: excerpt.highlightedRange
    }
  ];
});

interface TimelineItemProps {
  item: any;
  onClick: (
    range: [number, number],
    type: FoundationTextType,
    title: string
  ) => void;
}

class TimelineItem extends React.Component<TimelineItemProps, {}> {
  constructor(props: TimelineItemProps) {
    super(props);
  }
  handleClick = () => {
    console.log("YES!!! Clicked item");
    let { item } = this.props.item;
    this.props.onClick(item.range, item.document, item.content);
  };
  render() {
    var { item } = this.props;
    return (
      <div className="timeline__item" onClick={this.handleClick}>
        <label onClick={this.handleClick}>
          {item.content}
        </label>
        <button onClick={this.handleClick}>Click me</button>
      </div>
    );
  }
}

interface TimelineProps {
  onItemClick: (
    range: [number, number],
    type: FoundationTextType,
    title: string
  ) => void;
}

interface TimelineState {}

export default class Timeline extends React.Component<
  TimelineProps,
  TimelineState
> {
  private timeline: any;
  constructor(props: TimelineProps) {
    super(props);
  }
  initTimeline = () => {
    let container = document.getElementById("mytimeline");
    let items = new vis.DataSet(dataset);
    let options = {
      orientation: "top",
      start: new Date(1770, 0, 1),
      end: new Date(),
      order: this.orderById,
      template: (item: any, element: any) => {
        if (!item) {
          return;
        }
        ReactDOM.unmountComponentAtNode(element);
        return ReactDOM.render(
          <TimelineItem item={item} onClick={this.props.onItemClick} />,
          element
        );
      }
    };
    this.timeline = new vis.Timeline(container, items, options);
  };
  orderById = (a: VisDataItem, b: VisDataItem) => {
    return a.id - b.id;
  };
  componentDidMount() {
    this.initTimeline();
    // this.timeline.on('select', function (properties: any) {
    // 	console.log('Selected', properties);
    // });
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
