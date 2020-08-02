/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import React, { useState, useEffect } from "react";
import DocumentTextNodeList from "./DocumentTextNodeList";
import { FT } from "../java2ts/FT";
import { FoundationDataBuilder } from "../utils/foundationData/FoundationDataBuilder";
import { FoundationNode } from "../common/CaptionNodes";
import { alertErr, getHighlightedNodes } from "../utils/functions";
import { TakeBlock } from "./BlockEditor";

interface FeedCardContainerProps {
  username: string;
  title: string;
  titleSlug: string;
  blocks: TakeBlock[];
}

interface FeedCardContainerState {
  loading: boolean;
  document?: {
    fact: FT.Fact;
    nodes: FoundationNode[];
  };
  videoFact?: FT.VideoFactContent;
}

const FeedCardLoader: React.FC<FeedCardContainerProps> = (props) => {
  const [state, setState] = useState<FeedCardContainerState>({
    loading: true,
  });

  useEffect(() => {
    const getFacts = async () => {
      const builder = new FoundationDataBuilder();
      props.blocks.forEach((b) => {
        if (b.kind === "document") {
          builder.add(b.excerptId);
        } else if (b.kind === "video") {
          builder.add(b.videoId);
        }
      });
      const foundationData = await builder.build();
      props.blocks.forEach((b) => {
        if (b.kind === "document") {
          const documentContent = foundationData.getDocument(b.excerptId);
          let nodes: FoundationNode[] = [];
          for (let documentComponent of documentContent.components) {
            nodes.push({
              component: documentComponent.component,
              innerHTML: [documentComponent.innerHTML],
              offset: documentComponent.offset,
            });
          }

          setState({
            loading: false,
            document: {
              fact: documentContent.fact,
              nodes: nodes,
            },
          });
        } else if (b.kind === "video") {
          const videoContent = foundationData.getVideo(b.videoId);
          setState({
            loading: false,
            videoFact: videoContent,
          });
        }
      });
    };

    getFacts();
  }, []);
  if (state.loading) {
    return <FeedCardLoadingView />;
  } else {
    return (
      <FeedCard
        {...props}
        document={state.document}
        videoFact={state.videoFact}
      />
    );
  }
};

const FeedCardLoadingView: React.StatelessComponent<{}> = (props) => (
  <div className="feed__card">
    <h2 className="feed__card-title">Loading Take Preview</h2>
  </div>
);

interface FeedCardProps {
  username: string;
  titleSlug: string;
  title: string;
  blocks: TakeBlock[];
  document?: {
    fact: FT.Fact;
    nodes: FoundationNode[];
  };
  videoFact?: FT.VideoFactContent;
}

class FeedCard extends React.Component<FeedCardProps, {}> {
  constructor(props: FeedCardProps) {
    super(props);
  }
  render() {
    let { props } = this;
    return (
      <div className="feed__card">
        <a
          href={"/" + this.props.username + "/" + this.props.titleSlug}
          className="feed__link"
        >
          <span />
        </a>
        {props.blocks.map((block, blockIdx) => {
          if (block.kind === "document") {
            if (props.document) {
              let highlightedNodes = getHighlightedNodes(
                props.document.nodes,
                block.highlightedRange,
                block.viewRange
              );
              return (
                <div
                  className="feed__card-thumb-container feed__card-thumb-container--document"
                  key={blockIdx.toString()}
                >
                  <div className="feed__card-document">
                    <h2 className="feed__card-document-title">
                      {props.document.fact.title}
                    </h2>
                    <DocumentTextNodeList
                      className="feed__card-document-text"
                      documentNodes={highlightedNodes}
                    />
                  </div>
                </div>
              );
            } else {
              alertErr(
                "FeedCardContainer: documentNodes missing in DocumentBlock"
              );
              throw "FeedCardContainer: documentNodes missing in DocumentBlock";
            }
          } else if (block.kind === "video") {
            if (props.videoFact) {
              let thumb =
                "https://img.youtube.com/vi/" +
                props.videoFact.youtubeId +
                "/0.jpg";
              return (
                <div
                  className="feed__card-thumb-container feed__card-thumb-container--video"
                  key={blockIdx}
                >
                  <img className="feed__card-thumb" src={thumb} />
                </div>
              );
            } else {
              alertErr("FeedCardContainer: videoFact missing in VideoBlock");
              throw "FeedCardContainer: videoFact missing in VideoBlock";
            }
          }
        })}
        <div className="feed__card-excerpt">
          <h2 className="feed__card-title">{props.title}</h2>
          {props.blocks.map((block, blockIdx) => {
            if (block.kind === "paragraph") {
              return (
                <div
                  className="feed__card-text-container"
                  key={blockIdx.toString()}
                >
                  <p className="feed__card-text">{block.text}</p>
                </div>
              );
            }
          })}
        </div>
        <span className="feed__more">Read more</span>
      </div>
    );
  }
}

export default FeedCardLoader;
