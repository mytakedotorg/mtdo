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
import { SearchResult } from "./search";

const SVG_PADDING = 50;
const SVG_WIDTH = 510;
const SVG_HEIGHT = 318;
interface NGramViewerProps {
  searchResult: SearchResult;
}

const NGramViewer: React.FC<NGramViewerProps> = ({ searchResult }) => {
  const svgEl = useRef<SVGSVGElement>(null);
  useEffect(() => {
    drawChart(svgEl.current, searchResult);
  }, [svgEl]);
  return (
    <div className="ngram__outer-container">
      <div className="ngram__inner-container">
        <svg ref={svgEl} width={SVG_WIDTH} height={SVG_HEIGHT}></svg>
      </div>
    </div>
  );
};

function drawChart(
  svgElement: SVGSVGElement | null,
  searchResult: SearchResult
) {
  if (!svgElement) {
    return;
  }
  const svg = d3
    .select(svgElement)
    .append("g")
    .attr(
      "transform",
      "translate(" + SVG_PADDING + "," + SVG_PADDING / 2 + ")"
    );
  const hitsPerYear = getNumberOfHitsPerYear(searchResult);
  const yearMinMax = d3.extent(hitsPerYear, (hit) => hit.year);
  const hitMax = d3.max(hitsPerYear, (h) => h.hitCount);
  if (isNotEmpty(yearMinMax) && hitMax) {
    const x = d3
      .scaleTime()
      .domain(padYears(yearMinMax, 1))
      .range([0, SVG_WIDTH - SVG_PADDING]);
    const y = d3
      .scaleLinear()
      .domain([0, hitMax])
      .range([SVG_HEIGHT - SVG_PADDING, 0]);

    svg
      .append("g")
      .attr("transform", "translate(0," + (SVG_HEIGHT - SVG_PADDING) + ")")
      .call(d3.axisBottom(x));
    svg.append("g").call(d3.axisLeft(y));
    const line = d3
      .line<HitsPerYear>()
      .x((d) => x(d.year))
      .y((d) => y(d.hitCount));
    svg
      .append("path")
      .datum(hitsPerYear)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }
}

const getYearFromVideoFact = (videoFact: FT.VideoFactContent): Date => {
  const date = d3.timeParse("%Y-%m-%d")(videoFact.fact.primaryDate);
  if (!date) {
    throw `Error parsing date from video fact ${videoFact.fact.title}`;
  }
  date.setMonth(0); // January
  date.setDate(1); // 1st
  return date;
};

interface HitsPerYear {
  year: Date;
  hitCount: number;
}
function getNumberOfHitsPerYear(searchResult: SearchResult): HitsPerYear[] {
  const hitsPerYear: HitsPerYear[] = [];
  searchResult.factHits.forEach((hit) => {
    const year = getYearFromVideoFact(hit.videoFact);
    const hitCount = hit.searchHits.length;
    const existingHit = hitsPerYear.find((hit) => hit.year === year);
    if (existingHit) {
      existingHit.hitCount += hitCount;
    } else {
      hitsPerYear.push({
        year,
        hitCount,
      });
    }
  });
  /**
   * @TODO push 0 hitCount for missing years
   */
  return hitsPerYear;
}

function isNotEmpty<T>(
  d3Extent: [undefined, undefined] | [T, T]
): d3Extent is [T, T] {
  return !!d3Extent[0] && !!d3Extent[1];
}

function padYears(dates: [Date, Date], numYears: number): [Date, Date] {
  const firstDate = new Date(dates[0]);
  firstDate.setFullYear(firstDate.getFullYear() - numYears);
  const secondDate = new Date(dates[1]);
  secondDate.setFullYear(secondDate.getFullYear() + numYears);
  return [firstDate, secondDate];
}

export default NGramViewer;
