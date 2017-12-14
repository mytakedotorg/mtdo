import * as React from "react";
import * as ReactDOM from "react-dom";
import { FoundationNode } from "../utils/functions";
import { isVideo, isDocument, fetchFact } from "../utils/databaseAPI";
import TimelinePreview, { Ranges, SetFactHandlers } from "./TimelinePreview";
import TimelinePreviewLoadingView from "./TimelinePreviewLoadingView";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";

export interface TimelinePreviewContainerProps {
  factLink: Foundation.FactLink;
  setFactHandlers?: SetFactHandlers;
  ranges?: Ranges;
  offset?: number;
}

export interface TimelinePreviewContainerState {
  loading: boolean;
  videoFact?: Foundation.VideoFactContent;
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
        if (error) {
          throw error;
        } else {
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
            this.setState({
              loading: false,
              videoFact: factContent
            });
          } else {
            throw "Unknown kind of Fact";
          }
        }
      }
    );
  };
  componentDidMount() {
    this.getFact(this.props.factLink.hash);
  }
  componentWillReceiveProps(nextProps: TimelinePreviewContainerProps) {
    if (this.props.factLink.hash !== nextProps.factLink.hash) {
      this.setState({
        loading: true
      });
      this.getFact(nextProps.factLink.hash);
    }
  }
  render() {
    return (
      <TimelinePreviewContainerBranch
        containerProps={this.props}
        containerState={this.state}
      />
    );
  }
}

interface TimelinePreviewContainerBranchProps {
  containerProps: TimelinePreviewContainerProps;
  containerState: TimelinePreviewContainerState;
}

export const TimelinePreviewContainerBranch: React.StatelessComponent<
  TimelinePreviewContainerBranchProps
> = props => {
  if (props.containerState.loading) {
    return <TimelinePreviewLoadingView />;
  } else {
    return (
      <TimelinePreview
        factLink={props.containerProps.factLink}
        videoFact={props.containerState.videoFact}
        nodes={props.containerState.nodes}
        setFactHandlers={props.containerProps.setFactHandlers}
        ranges={props.containerProps.ranges}
        offset={props.containerProps.offset}
      />
    );
  }
};
