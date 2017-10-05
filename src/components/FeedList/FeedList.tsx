import * as React from "react";
import * as ReactDOM from "react-dom";
import FeedCard from "../FeedCard";
import { getAllUsers } from "../../utils/databaseAPI";
import { Article } from "../../utils/databaseData";

interface Card {
  username: string;
  article: Article;
}

interface FeedListProps {}

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

    for (let user of getAllUsers()) {
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
