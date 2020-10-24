/*
 * MyTake.org website and tooling.
 * Copyright (C) 2018-2020 MyTake.org, Inc.
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
import React, { FC, useEffect, useState } from "react";
import {
  HitsPerYearList,
  NGramViewerPresentation,
} from "../search/NGramViewer";
import { searchForCounts } from "./ngramData";

interface NGramLoaderProps {
  searchQuery: string;
}

const NGramLoader: FC<NGramLoaderProps> = (props) => {
  const [hitsPerYearList, setHitsPerYearList] = useState<HitsPerYearList>({
    hitsPerYear: [],
    allSearchTerms: [],
  });

  useEffect(() => {
    async function connectSearchDatabase() {
      const counts = await searchForCounts(props.searchQuery);
      setHitsPerYearList(counts);
    }

    props.searchQuery && connectSearchDatabase();
  }, [props.searchQuery]);

  return <NGramViewerPresentation hitsPerYearList={hitsPerYearList} />;
};

export default NGramLoader;
