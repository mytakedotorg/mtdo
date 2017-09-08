import * as React from "react";
import * as ReactDOM from "react-dom";

//import vis from "vis";
let vis = require("vis");

interface VisDataItem {
  id: number;
  content: string;
  start: string;
  end?: string;
}

let items = new vis.DataSet([
  // Using ratification dates
  { id: 0, content: "United States Constitution", start: "1788-06-21" },
  { id: 1, content: "Amendment 1", start: "1791-12-15" },
  { id: 2, content: "Amendment 2", start: "1791-12-15" },
  { id: 3, content: "Amendment 3", start: "1791-12-15" },
  { id: 4, content: "Amendment 4", start: "1791-12-15" },
  { id: 5, content: "Amendment 5", start: "1791-12-15" },
  { id: 6, content: "Amendment 6", start: "1791-12-15" },
  { id: 7, content: "Amendment 7", start: "1791-12-15" },
  { id: 8, content: "Amendment 8", start: "1791-12-15" },
  { id: 9, content: "Amendment 9", start: "1791-12-15" },
  { id: 10, content: "Amendment 10", start: "1791-12-15" },
  { id: 11, content: "Amendment 11", start: "1795-02-07" },
  { id: 12, content: "Amendment 12", start: "1804-06-15" },
  { id: 13, content: "Amendment 13", start: "1865-12-06" },
  { id: 14, content: "Amendment 14", start: "1868-07-09" },
  { id: 15, content: "Amendment 15", start: "1870-02-03" },
  { id: 16, content: "Amendment 16", start: "1913-02-03" },
  { id: 17, content: "Amendment 17", start: "1913-04-08" },
  { id: 18, content: "Amendment 18", start: "1919-01-16" },
  { id: 19, content: "Amendment 19", start: "1920-08-18" },
  { id: 20, content: "Amendment 20", start: "1933-01-23" },
  { id: 21, content: "Amendment 21", start: "1933-12-05" },
  { id: 22, content: "Amendment 22", start: "1951-02-27" },
  { id: 23, content: "Amendment 23", start: "1961-03-29" },
  { id: 24, content: "Amendment 24", start: "1964-01-23" },
  { id: 25, content: "Amendment 25", start: "1967-02-10" },
  { id: 26, content: "Amendment 26", start: "1971-07-01" },
  { id: 27, content: "Jimmy Carter - Gerald Ford #1", start: "1976-08-23" },
  { id: 28, content: "Jimmy Carter - Gerald Ford #2", start: "1976-10-06" },
  { id: 29, content: "Jimmy Carter - Gerald Ford #3", start: "1976-10-22" },
  { id: 30, content: "Amendment 27", start: "1992-05-05" }
]);

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
