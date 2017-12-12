import * as React from "react";
import * as ReactDOM from "react-dom";
import FeedCard from "./FeedCard";
import { TakeBlock } from "./BlockEditor";

export interface Card {
  username: string;
  title: string;
  titleSlug: string;
  blocks: TakeBlock[];
  previewBlocks: number[];
}

interface FeedListProps {
  cards: Card[];
}

const FeedList: React.StatelessComponent<FeedListProps> = props => {
  return (
    <div className="feed">
      <div className="feed__inner-container">
        {props.cards.map((card, idx) => {
          console.log("idx=" + idx);
          return (
            <FeedCard
              key={idx.toString()}
              username={card.username}
              title={card.title}
              titleSlug={card.titleSlug}
              blocks={card.blocks}
              previewBlocks={card.previewBlocks}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FeedList;
