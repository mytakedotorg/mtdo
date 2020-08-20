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
import React, { useState } from "react";
import { FT } from "../../java2ts/FT";
import SearchBar from "../SearchBar";
import VideoLite from "../VideoLite";
import NGramViewer from "./NGramViewer";
import { SearchMode, SearchResult } from "./search";
import SearchRadioButtons from "./SearchRadioButtons";
import VideoResultsList from "./VideoResultsList";

interface SearchContainerProps {
  mode: SearchMode;
  searchResult: SearchResult;
  onModeChange(mode: SearchMode): void;
}

interface VideoPlayerState {
  isVideoPlaying: boolean;
  videoProps?: {
    videoId: string;
    clipRange: [number, number];
  };
}

const dateToDivMap: Map<string, HTMLDivElement> = new Map();

const SearchContainer: React.FC<SearchContainerProps> = ({
  mode,
  onModeChange,
  searchResult,
}) => {
  const { factHits, searchQuery } = searchResult;
  const [{ isVideoPlaying, videoProps }, setVideoPlayerState] = useState<
    VideoPlayerState
  >({
    isVideoPlaying: false,
    videoProps: factHits.length
      ? {
          videoId: factHits[0].videoFact.youtubeId,
          clipRange: factHits[0].searchHits[0].getClipRange(),
        }
      : undefined,
  });

  const handleBarClick = (year: string) => {
    for (const [date, div] of dateToDivMap) {
      if (date.substring(0, 4) === year) {
        const y =
          div.getBoundingClientRect().top -
          getStickyHeaderHeight() +
          window.pageYOffset;
        scrollTo(y, () => {
          div.classList.toggle("results__preview--fade");
          setTimeout(() => {
            div.classList.toggle("results__preview--fade");
          }, 500);
        });
        break;
      }
    }
  };
  const handlePlayClick = (
    videoFact: FT.VideoFactContent,
    clipRange: [number, number]
  ) => {
    setVideoPlayerState({
      isVideoPlaying: true,
      videoProps: {
        videoId: videoFact.youtubeId,
        clipRange: clipRange,
      },
    });
  };
  const handleClipEnd = () => {
    setVideoPlayerState({
      isVideoPlaying: false,
    });
  };

  const searchResultCount = searchResult.factHits
    .flatMap((factHit) => factHit.searchHits)
    .reduce((total, hits) => {
      return total + hits.highlightOffsets.length;
    }, 0);
  return (
    <>
      <div className="search__sticky">
        {videoProps && isVideoPlaying && (
          <div className="search__video">
            <VideoLite {...videoProps} onClipEnd={handleClipEnd} />
          </div>
        )}
        <SearchBar initialSearchQuery={searchQuery} classModifier="mobile" />
        <h1 className="results__heading">{searchResultCount} Results Found</h1>
        {factHits.length === 0 ? (
          <p className="turn__results">
            Search returned no results for <strong>{searchQuery}</strong>
          </p>
        ) : (
          <NGramViewer
            searchResult={searchResult}
            onBarClick={handleBarClick}
          />
        )}
      </div>
      <div className="results">
        <div className="results__inner-container">
          <SearchRadioButtons onChange={onModeChange} selectedOption={mode} />
          <VideoResultsList
            dateToDivMap={dateToDivMap}
            onPlayClick={handlePlayClick}
            searchResult={searchResult}
          />
        </div>
      </div>
    </>
  );
};

// scrollTo with completion callback https://stackoverflow.com/a/55686711
function scrollTo(offset: number, callback: () => void) {
  const fixedOffset = offset.toFixed(),
    onScroll = function () {
      if (window.pageYOffset.toFixed() === fixedOffset) {
        window.removeEventListener("scroll", onScroll);
        callback();
      }
    };

  window.addEventListener("scroll", onScroll);
  onScroll();
  window.scrollTo({
    top: offset,
    behavior: "smooth",
  });
}

function getStickyHeaderHeight(): number {
  const NGRAM_CONTAINER_HEIGHT = 218;
  const NGRAM_MARGIN_BOTTOM = 8;
  if (window.innerWidth > 768) {
    const HEADER_HEIGHT = 40;
    const HEADING_HEIGHT = 44;
    return (
      HEADER_HEIGHT +
      HEADING_HEIGHT +
      NGRAM_CONTAINER_HEIGHT +
      NGRAM_MARGIN_BOTTOM
    );
  } else {
    const MOBILE_HEADING_HEIGHT = 31;
    const SEARCHBAR_HEIGHT = 88;
    return (
      SEARCHBAR_HEIGHT +
      MOBILE_HEADING_HEIGHT +
      NGRAM_CONTAINER_HEIGHT +
      NGRAM_MARGIN_BOTTOM
    );
  }
}
export default SearchContainer;
