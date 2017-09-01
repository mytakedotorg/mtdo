import * as React from "react";
import Debates from "../Debates";
import Document from "../Document";

export type FoundationTextType = "CONSTITUTION" | "AMENDMENTS";
export type FoundationView = "INITIAL" | "DEBATES" | "DOCUMENT";

export interface FoundationNode {
  component: string;
  props: FoundationNodeProps;
  innerHTML: Array<string | React.ReactNode>;
}

export interface FoundationNodeProps {
  key: string;
  dataOffset: string;
  index: string;
}

interface FoundationCardProps {
  onClick: () => void;
  image: string;
  width: number;
  height: number;
  title: string;
  description: string;
}

function FoundationCard(props: FoundationCardProps) {
  return (
    <div className="foundation__card" onClick={props.onClick}>
      <div className="foundation__image-container">
        <img
          src={props.image}
          className="foundation__image"
          width={props.width.toString()}
          height={props.height.toString()}
        />
      </div>
      <div className="foundation__info-container">
        <h3 className="foundation__card-title">
          {props.title}
        </h3>
        <p className="foundation__description">
          {props.description}
        </p>
      </div>
    </div>
  );
}

interface FoundationProps {
  handleDocumentSetClick: (
    type: FoundationTextType,
    range: [number, number]
  ) => void;
  handleVideoSetClick: (id: string, range: [number, number]) => void;
}

interface FoundationState {
  type: FoundationTextType | null;
  view: FoundationView;
}

export default class Foundation extends React.Component<
  FoundationProps,
  FoundationState
> {
  constructor(props: FoundationProps) {
    super(props);

    this.state = {
      type: null,
      view: "INITIAL"
    };
  }
  handleDocumentCardClick = (type: FoundationTextType) => {
    this.setState({
      type: type,
      view: "DOCUMENT"
    });
  };
  handleDebatesCardClick = () => {
    this.setState({ view: "DEBATES" });
  };
  handleBackClick = () => {
    this.setState({ view: "INITIAL" });
  };
  render() {
    let { props } = this;

    switch (this.state.view) {
      case "DOCUMENT":
        if (this.state.type) {
          return (
            <div className="foundation">
              <Document
                onBackClick={this.handleBackClick}
                onSetClick={props.handleDocumentSetClick}
                type={this.state.type}
              />
            </div>
          );
        }
      case "DEBATES":
        return (
          <div className="foundation">
            <Debates
              onBackClick={this.handleBackClick}
              onSetClick={props.handleVideoSetClick}
            />
          </div>
        );
      default:
        return (
          <div className="foundation">
            <h2 className="foundation__heading">The Foundation</h2>
            <p className="foundation__instructions">
              Browse the Foundation to support your take with Facts.
            </p>
            <div className="foundation__card-list">
              <FoundationCard
                onClick={() => this.handleDocumentCardClick("AMENDMENTS")}
                image="/images/amendments.jpg"
                width={220}
                height={313}
                title="The Amendments"
                description="The full text of the Amendments to the U.S. Constitution."
              />
              <FoundationCard
                onClick={() => this.handleDocumentCardClick("CONSTITUTION")}
                image="/images/constitution.jpg"
                width={220}
                height={313}
                title="The Constitution"
                description="The full text of the U.S. Constitution, as it was originally penned in 1787."
              />
              <FoundationCard
                onClick={this.handleDebatesCardClick}
                image="/images/debates.jpg"
                width={220}
                height={313}
                title="The Debates"
                description="Full videos and transcripts of all presidential debates since 1976."
              />
            </div>
          </div>
        );
    }
  }
}
