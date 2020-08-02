/*
 * MyTake.org website and tooling.
 * Copyright (C) 2017-2020 MyTake.org, Inc.
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
import { ImageProps } from "../java2ts/ImageProps";
import { Foundation } from "../java2ts/Foundation";
import { Routes } from "../java2ts/Routes";
import { decodeVideoFact } from "../common/DecodeVideoFact";
import { drawVideoFact, drawDocument, drawSpecs } from "../common/DrawFacts";
import { FoundationNode } from "../common/CaptionNodes";
import { alertErr, getHighlightedNodes, slugify } from "../utils/functions";
import {
  TakeDocument,
  DocumentBlock,
  VideoBlock,
} from "../components/BlockEditor";

function isDocument(
  fact?: Foundation.DocumentFactContent | Foundation.VideoFactContent | null
): fact is Foundation.DocumentFactContent {
  if (fact) {
    return (fact as Foundation.DocumentFactContent).fact.kind === "document";
  } else {
    return false;
  }
}

export type VideoContent =
  | Foundation.VideoFactContent
  | Foundation.VideoFactContentEncoded;
function isVideo(fact?: Foundation.FactContent | null): fact is VideoContent {
  if (fact) {
    return (fact as VideoContent).fact.kind === "video";
  } else {
    return false;
  }
}

export { isDocument, isVideo };
