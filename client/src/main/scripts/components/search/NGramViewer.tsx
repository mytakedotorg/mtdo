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
import React, { useEffect, useRef } from "react";
import { FT } from "../../java2ts/FT";
import { SearchHit, SearchResult } from "./search";

const SVG_PADDING = 50;
const SVG_WIDTH = 510;
const SVG_HEIGHT = 318;
interface NGramViewerProps {
  searchResult: SearchResult;
}

const NGramViewer: React.FC<NGramViewerProps> = ({ searchResult }) => {
  const svgEl = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (svgEl.current) {
      drawChart(svgEl.current, searchResult);
    }
  }, [svgEl]);
  return (
    <div className="ngram__outer-container">
      <div className="ngram__inner-container">
        <svg ref={svgEl} width={SVG_WIDTH} height={SVG_HEIGHT}></svg>
      </div>
    </div>
  );
};

function drawChart(svgElement: SVGSVGElement, searchResult: SearchResult) {
  const svg = d3
    .select(svgElement)
    .append("g")
    .attr(
      "transform",
      "translate(" + SVG_PADDING + "," + SVG_PADDING / 2 + ")"
    );
  const { hitsPerYear, allSearchTerms } = getNumberOfHitsPerYear(searchResult);
  const yearMinMax = d3.extent(hitsPerYear, (hit) => hit.year) as [Date, Date];
  // get x-axis ticks
  const xScale = d3
    .scaleTime()
    .domain(padYears(yearMinMax, 1))
    .range([0, SVG_WIDTH - SVG_PADDING]);
  // draw x-axis
  svg
    .append("g")
    .attr("transform", "translate(0," + (SVG_HEIGHT - SVG_PADDING) + ")")
    .call(d3.axisBottom(xScale));

  const hitMax = d3.max(hitsPerYear, (h) => h.hitCount)!;
  allSearchTerms.forEach((term) => {
    const hitsPerYearForTerm = hitsPerYear.filter(
      (hpy) => hpy.searchTerm === term
    );
    // get y-axis ticks
    const yScale = d3
      .scaleLinear()
      .domain([0, hitMax + Math.round(hitMax * 0.1)])
      .range([SVG_HEIGHT - SVG_PADDING, 0]);

    // draw y-axis
    svg.append("g").call(d3.axisLeft(yScale)); // @TODO only need to draw this once
    const line = d3
      .line<HitsPerYear>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.hitCount));
    svg
      .append("path")
      .datum(hitsPerYearForTerm)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  });
}

const getYearFromVideoFact = (videoFact: FT.VideoFactContent): Date => {
  const date = d3.timeParse("%Y-%m-%d")(videoFact.fact.primaryDate);
  date!.setMonth(0); // January
  date!.setDate(1); // 1st
  return date!;
};

interface HitsPerYear {
  year: Date;
  hitCount: number;
  searchTerm: string;
}
interface HitsPerYearList {
  hitsPerYear: HitsPerYear[];
  allSearchTerms: string[];
}
const ALL_DEBATE_YEARS = [
  "1960",
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
function getNumberOfHitsPerYear(searchResult: SearchResult): HitsPerYearList {
  const terms = new Set<string>(getSearchTerms(searchResult.searchQuery));
  const hitsPerYear: HitsPerYear[] = [];
  ALL_DEBATE_YEARS.forEach((y) => {
    terms.forEach((t) => {
      hitsPerYear.push({
        year: new Date(parseInt(y), 0),
        hitCount: 0,
        searchTerm: t,
      });
    });
  });
  searchResult.factHits.forEach((hit) => {
    const year = getYearFromVideoFact(hit.videoFact);
    const hitsPerTerm = getHitsPerTerm(hit.searchHits);
    for (const [term, hitCount] of hitsPerTerm) {
      const existingHit = hitsPerYear.find(
        (h) =>
          h.year.getFullYear() === year.getFullYear() && h.searchTerm === term
      )!;
      existingHit.hitCount += hitCount;
    }
  });
  return {
    hitsPerYear,
    allSearchTerms: Array.from(terms),
  };
}

function padYears(dates: [Date, Date], numYears: number): [Date, Date] {
  const firstDate = new Date(dates[0]);
  firstDate.setFullYear(firstDate.getFullYear() - numYears);
  const secondDate = new Date(dates[1]);
  secondDate.setFullYear(secondDate.getFullYear() + numYears);
  return [firstDate, secondDate];
}

function getSearchTerms(searchQuery: string): string[] {
  return searchQuery
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function _getSearchTerms(searchQuery: string): string[] {
  return getSearchTerms(searchQuery);
}

function getHitsPerTerm(searchHits: SearchHit[]): Map<string, number> {
  const hitsPerTerm: Map<string, number> = new Map();
  searchHits.forEach((hit) => {
    hit.highlightOffsets.forEach((h) => {
      const term = h[2];
      let count: number;
      if (hitsPerTerm.has(term)) {
        count = hitsPerTerm.get(term)! + 1;
      } else {
        count = 1;
      }
      hitsPerTerm.set(term, count);
    });
  });
  return hitsPerTerm;
}

export default NGramViewer;
