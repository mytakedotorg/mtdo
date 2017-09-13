import * as React from "react";
import Debates from "../Debates";
import Document from "../Document";

export type FoundationTextType = "CONSTITUTION";
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

interface FoundationState {}

export default class Foundation extends React.Component<
  FoundationProps,
  FoundationState
> {
  constructor(props: FoundationProps) {
    super(props);
  }
  render() {
    return <p>Old component about to be removed or replaced </p>;
  }
}
