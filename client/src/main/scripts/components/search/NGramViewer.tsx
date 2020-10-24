/*
 * MyTake.org website and tooling.
 * Copyright (C) 2020 MyTake.org, Inc.
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
import * as d3 from "d3";
import React, { useEffect, useRef, useState } from "react";
import { CornerLeftUp } from "react-feather";
import { FT } from "../../java2ts/FT";
import { SearchResult } from "./search";

const SVG_PADDING_LEFT = 25;
const SVG_PADDING_TOP = 40;
const SVG_WIDTH = Math.min(700, window.innerWidth);
const SVG_HEIGHT = 200;
const colors = d3
  .scaleOrdinal(d3.schemeSet2)
  .range()
  .map((c) => d3.rgb(c).darker(0.25).toString());

interface NGramViewerProps {
  searchResult: SearchResult;
  onBarClick?(year: string): void;
}

const NGramViewer: React.FC<NGramViewerProps> = (props) => {
  const [hitsPerYearList, setHitsPerYearList] = useState<HitsPerYearList>(
    getNumberOfHitsPerYear(props.searchResult)
  );
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender) {
      firstRender.current = false;
    } else {
      setHitsPerYearList(getNumberOfHitsPerYear(props.searchResult));
    }
  }, [props.searchResult.searchQuery]);
  return (
    <NGramViewerPresentation
      hitsPerYearList={hitsPerYearList}
      onBarClick={props.onBarClick}
    />
  );
};

interface NGramViewerPresentationProps {
  onBarClick?(year: string): void;
  hitsPerYearList: HitsPerYearList;
}
export const NGramViewerPresentation: React.FC<NGramViewerPresentationProps> = (
  props
) => {
  const svgEl = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (svgEl.current) {
      drawChart(svgEl.current, props.hitsPerYearList, props.onBarClick);
    }
  }, [svgEl, props.hitsPerYearList]);
  return (
    <div className="ngram__outer-container">
      <div className="ngram__inner-container">
        <svg ref={svgEl} width={SVG_WIDTH} height={SVG_HEIGHT}></svg>
        <div className="ngram__legend">
          <div className="ngram__term-list">
            {props.hitsPerYearList.allSearchTerms.map((term, idx) => {
              return (
                <span
                  key={term}
                  style={{ color: colors[idx] }}
                  className="ngram__text ngram__text--term"
                >
                  {term}
                </span>
              );
            })}
          </div>
          <div className="ngram__term-list">
            <CornerLeftUp />
            <span className="ngram__text">click any year to scroll</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function drawChart(
  svgElement: SVGSVGElement,
  hitsPerYearList: HitsPerYearList,
  onBarClick?: (year: string) => void
) {
  d3.select(svgElement).selectAll("*").remove();
  const svg = d3
    .select(svgElement)
    .append("g")
    .attr(
      "transform",
      "translate(" + SVG_PADDING_LEFT + "," + SVG_PADDING_TOP / 3 + ")"
    );
  // X-Axis
  const xScale = d3
    .scaleBand()
    .domain(ALL_DEBATE_YEARS)
    .range([0, SVG_WIDTH - SVG_PADDING_LEFT * 2])
    .padding(0.1);
  const xAxisGenerator = d3.axisBottom(xScale);
  const xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + (SVG_HEIGHT - SVG_PADDING_TOP) + ")")
    .call(xAxisGenerator);
  xAxis
    .selectAll(".tick text")
    .attr("transform", "translate(10, 5)rotate(45)")
    .style("cursor", "pointer")
    .on("click", function (year: string) {
      onBarClick && onBarClick(year);
    });
  xAxis.selectAll(".tick line").attr("visibility", "hidden");
  const hitMax = d3.max(hitsPerYearList.hitsPerYear, (h) => h.hitCount)!;
  // Y-Axis
  const yScale = d3
    .scaleLinear()
    .domain([0, hitMax + Math.round(hitMax * 0.1)])
    .range([SVG_HEIGHT - SVG_PADDING_TOP, 0]);
  const yAxisGenerator = d3.axisLeft(yScale).ticks(Math.min(hitMax, 5), "d");
  svg.append("g").call(yAxisGenerator);

  hitsPerYearList.allSearchTerms.forEach((term, idx) => {
    const hitsPerYearForTerm = hitsPerYearList.hitsPerYear.filter(
      (hpy) => hpy.searchTerm === term
    );
    svg
      .append("g")
      .attr("fill", colors[idx])
      .selectAll("rect")
      .data(hitsPerYearForTerm)
      .join("rect")
      .attr(
        "x",
        (d) =>
          xScale(d.year)! +
          (xScale.bandwidth() / hitsPerYearList.allSearchTerms.length) * idx
      )
      .attr("y", (d) => yScale(d.hitCount))
      .attr("height", (d) => yScale(0) - yScale(d.hitCount))
      .attr("width", xScale.bandwidth() / hitsPerYearList.allSearchTerms.length)
      .on("click", function (d) {
        onBarClick && onBarClick(d.year);
      })
      .style("cursor", "pointer");
  });
}

const getYearFromVideoFact = (videoFact: FT.VideoFactContent): string => {
  return videoFact.fact.primaryDate.split("-")[0];
};

interface HitsPerYear {
  year: string; // 4 character year representation, e.g. "2020"
  hitCount: number;
  searchTerm: string;
}
export interface HitsPerYearList {
  hitsPerYear: HitsPerYear[];
  allSearchTerms: string[];
}
const ALL_DEBATE_YEARS = [
  "1960",
  ",",
  "1976",
  "1980",
  "1984",
  "1988",
  "1992",
  "1996",
  "2000",
  "2004",
  "2008",
  "2012",
  "2016",
  "2020",
];
export function getNumberOfHitsPerYear(
  searchResult: SearchResult
): HitsPerYearList {
  const terms = getSearchTerms(searchResult.searchQuery);
  const hitsPerYear: HitsPerYear[] = ALL_DEBATE_YEARS.flatMap((year) =>
    terms.map((searchTerm) => ({
      year,
      hitCount: searchResult.factHits.flatMap((hit) => {
        return hit.searchHits
          .filter((sh) => {
            return getYearFromVideoFact(sh.videoFact) === year;
          })
          .flatMap((sh) => {
            return sh.highlightOffsets.filter((ho) => {
              return ho[2] === searchTerm.toLowerCase();
            });
          });
      }).length,
      searchTerm,
    }))
  );
  return {
    hitsPerYear,
    allSearchTerms: terms,
  };
}

function getSearchTerms(searchQuery: string): string[] {
  return [
    ...new Set(
      searchQuery
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.charAt(0) !== "-")
    ),
  ];
}

export function _getSearchTerms(searchQuery: string): string[] {
  return getSearchTerms(searchQuery);
}

export default NGramViewer;
