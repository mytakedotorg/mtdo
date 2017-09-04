import * as React from "react";
import * as ReactDOM from "react-dom";

//import vis from "vis";
let vis = require("vis");

let items = new vis.DataSet([
	{id: 1, content: 'item 1', start: '2013-04-20'},
	{id: 2, content: 'item 2', start: '2013-04-14'},
	{id: 3, content: 'item 3', start: '2013-04-18'},
	{id: 4, content: 'item 4', start: '2013-04-16', end: '2013-04-19'},
	{id: 5, content: 'item 5', start: '2013-04-25'},
	{id: 6, content: 'item 6', start: '2013-04-27'}
]);

class ItemTemplate extends React.Component<{item:any}, {}> {
	render() {
		var { item } = this.props;
		return (
			<div>
				<label>{item.content}</label>
			</div>
		)
	}
};

let options = {
	orientation: 'top',
	maxHeight: 400,
	start: new Date(2013, 2, 1),
	end: new Date(2013, 5, 31),
	template: function (item: any, element: any) {
		if (!item) { return }
		ReactDOM.unmountComponentAtNode(element);
		return ReactDOM.render(<ItemTemplate item={item} />, element);
	}
};

function initTimeline() {
	var container = document.getElementById('mytimeline');
	let timeline = new vis.Timeline(container, items, options);
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
				<div id="mytimeline"></div>
			</div>
		);
  }
}
