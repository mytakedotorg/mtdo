import * as React from "react";
import * as ReactDOM from "react-dom";
import database from "../../utils/database";

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
      id: idx++,
      start: video.date,
      content: video.title
    }
  ];
});

database.excerpts.map(excerpt => {
  dataset = [
    ...dataset,
    {
      id: idx++,
      start: excerpt.date,
      content: excerpt.name
    }
  ];
});

let items = new vis.DataSet(dataset);

class ItemTemplate extends React.Component<{ item: any }, {}> {
  render() {
    var { item } = this.props;
    return (
      <div>
        <label>
          {item.content}
        </label>
      </div>
    );
  }
}

let options = {
  orientation: "top",
  start: new Date(1770, 0, 1),
  end: new Date(),
  order: orderById,
  template: function(item: any, element: any) {
    if (!item) {
      return;
    }
    ReactDOM.unmountComponentAtNode(element);
    return ReactDOM.render(<ItemTemplate item={item} />, element);
  }
};

function initTimeline() {
  var container = document.getElementById("mytimeline");
  let timeline = new vis.Timeline(container, items, options);
}

function orderById(a: VisDataItem, b: VisDataItem) {
  return a.id - b.id;
}

interface TimelineProps {}

interface TimelineState {}

export default class Timeline extends React.Component<
  TimelineProps,
  TimelineState
> {
  constructor(props: TimelineProps) {
    super(props);
  }
  componentDidMount() {
    return initTimeline();
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
