/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2019 MyTake.org, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * You can contact us at team@mytake.org
 */
import * as React from "react";
import { FoundationNode } from "../common/CaptionNodes";
import { alertErr } from "../utils/functions";
import { isVideo, isDocument, fetchFact } from "../utils/databaseAPI";
import TimelinePreview, { Ranges, SetFactHandlers } from "./TimelinePreview";
import TimelinePreviewLoadingView from "./TimelinePreviewLoadingView";
import { Foundation } from "../java2ts/Foundation";

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
          if (typeof error != "string") {
            alertErr("TimelinePreviewContainer: " + error.message);
          } else {
            alertErr("TimelinePreviewContainer: " + error);
          }
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
            alertErr("TimelinePreviewContainer: Unknown kind of Fact");
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
