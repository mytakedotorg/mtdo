/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2018 MyTake.org, Inc.
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

const FeedList: React.StatelessComponent<FeedListProps> = (props) => {
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
