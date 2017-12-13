import * as React from "react";
import * as ReactDOM from "react-dom";
import DocumentTextNodeList from "./DocumentTextNodeList";
import { fetchFact } from "../utils/databaseAPI";
import { Foundation } from "../java2ts/Foundation";
import { FoundationNode, getHighlightedNodes } from "../utils/functions";
import { TakeBlock, VideoBlock, DocumentBlock } from "./BlockEditor";

interface FeedCardContainerProps {
  username: string;
  title: string;
  titleSlug: string;
  blocks: TakeBlock[];
}

interface FeedCardContainerState {
  loading: boolean;
  error: boolean;
  document?: {
    fact: Foundation.Fact;
    nodes: FoundationNode[];
  };
  videoFact?: Foundation.VideoFactContent;
}

class FeedCardContainer extends React.Component<
  FeedCardContainerProps,
  FeedCardContainerState
> {
  constructor(props: FeedCardContainerProps) {
    super(props);

    this.state = {
      loading: true,
      error: false
    };
  }
  getDocumentFact = (factHash: string) => {
    fetchFact(
      factHash,
      (
        error: string | Error | null,
        factContent: Foundation.DocumentFactContent
      ) => {
        if (error || !factContent) {
          this.setState({
            error: true
          });
        } else {
          let nodes: FoundationNode[] = [];
          for (let documentComponent of factContent.components) {
            nodes.push({
              component: documentComponent.component,
              innerHTML: [documentComponent.innerHTML],
              offset: documentComponent.offset
            });
          }

          this.setState({
            loading: false,
            document: {
              fact: factContent.fact,
              nodes: nodes
            }
          });
        }
      }
    );
  };
  getVideoFact = (factHash: string) => {
    fetchFact(
      factHash,
      (
        error: string | Error | null,
        factContent: Foundation.VideoFactContent
      ) => {
        if (error || !factContent) {
          this.setState({
            error: true
          });
        } else {
          this.setState({
            loading: false,
            videoFact: factContent
          });
        }
      }
    );
  };
  handleRetryClick = () => {
    // this.setState({
    //   loading: true,
    //   error: false
    // });
    // this.getFact(this.props.block.excerptId);
  };
  componentDidMount() {
    for (let block of this.props.blocks) {
      if (block.kind === "document") {
        this.getDocumentFact(block.excerptId);
      } else if (block.kind === "video") {
        this.getVideoFact(block.videoId);
      }
    }
  }
  render() {
    return (
      <FeedCardBranch
        containerProps={this.props}
        containerState={this.state}
        handleRetryClick={this.handleRetryClick}
      />
    );
  }
}

interface FeedCardBranchProps {
  containerProps: FeedCardContainerProps;
  containerState: FeedCardContainerState;
  handleRetryClick: () => any;
}

export const FeedCardBranch: React.StatelessComponent<
  FeedCardBranchProps
> = props => {
  if (props.containerState.error) {
    // return <FeedCardErrorView onRetryClick={props.handleRetryClick} />;
    return <p>FeedCardErrorView</p>;
  } else if (
    props.containerState.loading
    // || (!props.containerState.document && !props.containerState.videoFact)
  ) {
    // return <FeedCardLoadingView />
    return <p>FeedCardLoadingView</p>;
  } else {
    return (
      <FeedCard
        {...props.containerProps}
        document={props.containerState.document}
        videoFact={props.containerState.videoFact}
      />
    );
  }
};

interface FeedCardProps {
  username: string;
  titleSlug: string;
  title: string;
  blocks: TakeBlock[];
  document?: {
    fact: Foundation.Fact;
    nodes: FoundationNode[];
  };
  videoFact?: Foundation.VideoFactContent;
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
              throw "documentNodes missing in DocumentBlock";
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
              throw "videoFact missing in VideoBlock";
            }
          } else {
            throw "some wonky error";
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

export default FeedCardContainer;
