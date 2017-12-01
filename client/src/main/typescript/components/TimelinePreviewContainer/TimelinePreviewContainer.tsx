import * as React from "react";
import * as ReactDOM from "react-dom";
import { fetchFact, FoundationNode } from "../../utils/functions";
import { isVideo, isDocument } from "../../utils/databaseData";
import TimelinePreview, { Ranges, SetFactHandlers } from "../TimelinePreview";
import TimelinePreviewLoadingView from "../TimelinePreviewLoadingView";
import { Foundation } from "../../java2ts/Foundation";
import { Routes } from "../../java2ts/Routes";

interface TimelinePreviewContainerProps {
  factLink: Foundation.FactLink;
  setFactHandlers?: SetFactHandlers;
  ranges?: Ranges;
  offset?: number;
}

interface TimelinePreviewContainerState {
  loading: boolean;
  nodes?: FoundationNode[];
}

export default class TimelinePreviewContainer extends React.Component<
  TimelinePreviewContainerProps,
  TimelinePreviewContainerState
> {
  constructor(props: TimelinePreviewContainerProps) {
    super(props);

    this.state = {
      loading: true
    };
  }
  getFact = (factHash: string) => {
    fetchFact(
      factHash,
      (
        error: string | Error | null,
        factContent:
          | Foundation.DocumentFactContent
          | Foundation.VideoFactContent
      ) => {
        if (error) throw error;
        let nodes: FoundationNode[] = [];

        if (isDocument(factContent)) {
          for (let documentComponent of factContent.components) {
            nodes.push({
              component: documentComponent.component,
              innerHTML: [documentComponent.innerHTML],
              offset: documentComponent.offset
            });
          }

          this.setState({
            loading: false,
            nodes: nodes
          });
        } else if (isVideo(factContent)) {
          throw "TODO";
        } else {
          throw "Unknown kind of Fact";
        }
      }
    );
  };
  componentDidMount() {
    this.getFact(this.props.factLink.hash);
  }
  componentWillReceiveProps(nextProps: TimelinePreviewContainerProps) {
    if (this.props.factLink.hash !== nextProps.factLink.hash) {
      this.getFact(nextProps.factLink.hash);
    }
  }
  render() {
    return (
      <div>
        {this.state.loading || !this.state.nodes
          ? <TimelinePreviewLoadingView />
          : <TimelinePreview
              factLink={this.props.factLink}
              nodes={this.state.nodes}
              setFactHandlers={this.props.setFactHandlers}
              ranges={this.props.ranges}
              offset={this.props.offset}
            />}
      </div>
    );
  }
}
