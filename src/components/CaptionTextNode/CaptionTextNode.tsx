import * as React from "react";
import * as ReactDOM from "react-dom";
import { CaptionNode, convertTimestampToSeconds } from "../../utils/functions";
import { CaptionWord } from "../../utils/databaseData";

interface DataAttributes {
  "data-offset": number;
  "data-start": number;
  "data-end": number;
  "data-map": string;
}

interface CaptionTextNodeProps {
  documentNode: CaptionNode;
  wordCount: number;
  captionWordMap: CaptionWord[];
}

interface CaptionTextNodeState {
  contentMap: number[];
}

class CaptionTextNode extends React.Component<
  CaptionTextNodeProps,
  CaptionTextNodeState
> {
  private text: HTMLHeadingElement | HTMLParagraphElement;
  constructor(props: CaptionTextNodeProps) {
    super(props);

    this.state = {
      contentMap: []
    };
  }
  setScrollData = () => {
    if (this.text) {
      let content: string = this.props.documentNode.innerHTML.toString();
      let contentArr = content.split(/[\s]+/);
      let height = 0;
      this.text.innerHTML = "";
      let contentMap = [];
      for (let idx in contentArr) {
        this.text.innerHTML += contentArr[idx] + " ";
        // console.log(idx, contentArr[idx]);
        if (this.text.clientHeight !== height) {
          let wordCount: number;
          if (this.props.wordCount) {
            wordCount = parseInt(idx) + this.props.wordCount;
          } else {
            wordCount = parseInt(idx);
          }
          //get timestamp of word
          if (
            this.props.captionWordMap &&
            this.props.captionWordMap[wordCount]
          ) {
            contentMap.push(
              convertTimestampToSeconds(
                this.props.captionWordMap[wordCount].timestamp
              )
            );
          }

          //contentMap.push(wordCount);
          height = this.text.clientHeight;
        }
      }
      this.setState({
        contentMap: contentMap
      });
    }
  };
  componentDidMount() {
    this.setScrollData();
  }
  render() {
    const { documentNode } = this.props;

    let attributes: DataAttributes = {
      "data-offset": documentNode.props.offset,
      "data-start": documentNode.props.start,
      "data-end": documentNode.props.end,
      "data-map": JSON.stringify(this.state.contentMap)
    };

    switch (documentNode.component) {
      case "h2":
        return (
          <div className="document__node">
            <h2
              className="document__node-text document__node-text--h2"
              {...attributes}
            >
              {documentNode.innerHTML}
            </h2>
            <div className="document__node-height-div">
              <h2
                className="document__node-text document__node-text--hidden-h2"
                ref={(text: HTMLHeadingElement) => {
                  this.text = text;
                }}
              >
                {documentNode.innerHTML}
              </h2>
            </div>
          </div>
        );
      case "h3":
        return (
          <div className="document__node">
            <h3
              className="document__node-text document__node-text--h3"
              {...attributes}
            >
              {documentNode.innerHTML}
            </h3>
            <div className="document__node-height-div">
              <h3
                className="document__node-text document__node-text--hidden-h3"
                ref={(text: HTMLHeadingElement) => {
                  this.text = text;
                }}
              >
                {documentNode.innerHTML}
              </h3>
            </div>
          </div>
        );
      case "p":
        return (
          <div className="document__node">
            <p
              className="document__node-text document__node-text--p"
              {...attributes}
            >
              {documentNode.innerHTML}
            </p>
            <div className="document__node-height-div">
              <p
                className="document__node-text document__node-text--hidden-p"
                ref={(text: HTMLParagraphElement) => {
                  this.text = text;
                }}
              />
            </div>
          </div>
        );
      default:
        // Unknown element, silently throw error here
        return <div />;
    }
  }
}

export default CaptionTextNode;
