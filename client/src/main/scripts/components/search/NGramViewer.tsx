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
const colors = d3
  .scaleOrdinal(d3.schemeSet2)
  .range()
  .map((c) => d3.rgb(c).darker(0.25).toString());

interface NGramViewerProps {
  searchResult: SearchResult;
  onBarClick?(year: string): void;
}

export enum NGramKind {
  SEARCH,
  HOMEPAGE,
  SOCIAL,
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
      kind={NGramKind.SEARCH}
    />
  );
};

function classModifier(kind: NGramKind): string | undefined {
  return kind === NGramKind.HOMEPAGE ? "home" : undefined;
}

function showHelpText(kind: NGramKind): boolean {
  return kind === NGramKind.SEARCH;
}

function showLegend(kind: NGramKind): boolean {
  return kind === NGramKind.SEARCH || kind == NGramKind.HOMEPAGE;
}

function width(kind: NGramKind): number {
  if (kind === NGramKind.SOCIAL) {
    return 550;
  } else {
    return Math.min(700, window.innerWidth);
  }
}

function height(kind: NGramKind): number {
  return kind == NGramKind.SOCIAL ? 250 : 200;
}

interface NGramViewerPresentationProps {
  onBarClick?(year: string): void;
  hitsPerYearList: HitsPerYearList;
  kind: NGramKind;
}
export const NGramViewerPresentation: React.FC<NGramViewerPresentationProps> = (
  props
) => {
  const svgEl = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (svgEl.current) {
      drawChart(
        props.kind,
        svgEl.current,
        props.hitsPerYearList,
        props.onBarClick
      );
    }
  }, [svgEl, props.hitsPerYearList]);
  let className = "ngram__outer-container";
  if (classModifier(props.kind)) {
    className += ` ${className}--${classModifier(props.kind)}`;
  }
  return (
    <div className={className}>
      <div className="ngram__inner-container">
        <svg
          ref={svgEl}
          width={width(props.kind)}
          height={height(props.kind)}
        ></svg>
        <div className="ngram__legend">
          <div className="ngram__term-list">
            {showLegend(props.kind) &&
              props.hitsPerYearList.allSearchTerms.map((term, idx) => {
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
          {showHelpText(props.kind) && (
            <div className="ngram__term-list">
              <CornerLeftUp />
              <span className="ngram__text">click any year to scroll</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function drawChart(
  kind: NGramKind,
  svgElement: SVGSVGElement,
  hitsPerYearList: HitsPerYearList,
  onBarClick?: (year: string) => void
) {
  let data = [];
  for (let year of ALL_DEBATE_YEARS) {
    let yearEntry = { year: year } as any;
    for (let searchTerm of hitsPerYearList.allSearchTerms) {
      for (let hit of hitsPerYearList.hitsPerYear) {
        if (hit.year === year) {
          yearEntry[hit.searchTerm] = hit.hitCount;
        }
      }
    }
    data.push(yearEntry);
  }
  const series = d3.stack().keys(hitsPerYearList.allSearchTerms)(data);

  d3.select(svgElement).selectAll("*").remove();
  const svg = d3
    .select(svgElement)
    .append("g")
    .attr(
      "transform",
      "translate(" + SVG_PADDING_LEFT + "," + SVG_PADDING_TOP / 3 + ")"
    );
  // NEW COLOR
  const color = d3
    .scaleOrdinal()
    .domain(series.map((d) => d.key))
    .range(colors);
  // NEW X
  const x = d3
    .scaleBand()
    .domain(ALL_DEBATE_YEARS)
    .range([0, width(kind) - SVG_PADDING_LEFT * 2])
    .padding(0.1);
  const xAxis = svg
    .append("g")
    .attr("transform", "translate(0," + (height(kind) - SVG_PADDING_TOP) + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));
  xAxis
    .selectAll(".tick text")
    .attr("transform", "translate(10, 5)rotate(45)")
    .style("cursor", "pointer")
    .on("click", function (year: string) {
      onBarClick && onBarClick(year);
    });
  xAxis.selectAll(".tick line").attr("visibility", "hidden");

  // NEW Y
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(series, (d) => d3.max(d, (d) => d[1])!)!])
    .rangeRound([height(kind) - SVG_PADDING_TOP, 0]);
  svg.append("g").call(d3.axisLeft(y).ticks(null, "s"));

  // NEW DATA
  svg
    .append("g")
    .selectAll("g")
    .data(series)
    .join("g")
    .attr("fill", (d) => color(d.key) as string)
    .selectAll("rect")
    .data((d) => d)
    .join("rect")
    .attr("x", (d, i) => x((d.data as any).year)!)
    .attr("y", (d) => y(d[1])!)
    .attr("height", (d) => y(d[0])! - y(d[1])!)
    .attr("width", x.bandwidth())
    .on("click", function (d) {
      console.log(d);
      onBarClick && onBarClick((d.data as any).year);
    })
    .on("mouseover", function (d, i) {
      d3.select(this).transition().duration(50).attr("opacity", ".85");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).transition().duration(50).attr("opacity", "1");
    })
    .style("cursor", "pointer");
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
