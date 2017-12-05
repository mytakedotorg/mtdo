import * as React from "react";
import * as ReactDOM from "react-dom";
import FeedCard from "../FeedCard";
import { TakeBlock } from "../BlockEditor";

export interface Article {
  title: string;
  titleSlug: string;
  blocks: TakeBlock[];
  previewBlocks: number[];
}

interface User {
  name: string;
  articles: Article[] | null;
}

interface Card {
  username: string;
  article: Article;
}

interface FeedListProps {
  users: User[];
}

interface FeedListState {
  cards: Card[];
}

class FeedList extends React.Component<FeedListProps, FeedListState> {
  constructor(props: FeedListProps) {
    super(props);

    this.state = {
      cards: this.getCards()
    };
  }
  getCards = () => {
    let cards: Card[] = [];

    for (let user of this.props.users) {
      if (user.articles) {
        cards = user.articles.map(article => {
          return {
            username: user.name,
            article: article
          };
        });
      }
    }

    return cards;
  };
  render() {
    return (
      <div className="feed">
        <div className="feed__inner-container">
          {this.state.cards.map((card, idx) => {
            return (
              <FeedCard
                key={idx}
                username={card.username}
                article={card.article}
              />
            );
          })}
        </div>
      </div>
    );
  }
}

export default FeedList;
