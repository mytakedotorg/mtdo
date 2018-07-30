import * as React from "react";
import FeedCardContainer from "./FeedCardContainer";
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
          let previewBlocks: TakeBlock[] = [];
          for (let previewIdx of card.previewBlocks) {
            previewBlocks.push(card.blocks[previewIdx]);
          }
          return (
            <FeedCardContainer
              key={idx.toString()}
              username={card.username}
              title={card.title}
              titleSlug={card.titleSlug}
              blocks={previewBlocks}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FeedList;
