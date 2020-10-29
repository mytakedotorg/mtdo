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
const rison = require("rison-node");

export type CharOffsetRange = [firstChar: number, lastChar: number];
export type VideoTurn = {
  kind: "videoTurn";
  fact: string;
  turn: number;
  cut: CharOffsetRange;
  bold?: Array<[number, number]>;
};

export type ClipRange = [startTime: number, endTime: number];
export type VideoCut = {
  cut: ClipRange;
  fact: string;
  kind: "videoCut";
};

export type FactUncut = {
  fact: string;
  kind: "factUncut";
};

export type TextCut = {
  cut: [number, number];
  bold?: Array<[number, number]>;
  fact: string;
  kind: "textCut";
};

export type SearchResults = {
  query: string;
  kind: "searchResults";
};

export enum Corpus {
  "Debates" = "Debates",
  "Documents" = "Documents",
}

export type Social = VideoCut | TextCut | FactUncut | SearchResults;
const socialKindRuntime = new Set([
  "videoCut",
  "textCut",
  "factUncut",
  "searchResults",
]);
export type PreviewSocial = VideoCut | TextCut | FactUncut;

export function encodeSocial(embed: Social) {
  // TODO: limit floating point precision
  // https://github.com/w33ble/rison-node/issues/4
  // TODO: durable rison https://github.com/mytakedotorg/mtdo/issues/355
  const raw = rison.encode_object(embed) as string;
  return "~" + raw.replace(/:!\(/gi, ":(");
}

export function decodeSocial(encoded: string): Social {
  if (encoded.startsWith("~")) {
    const sub = encoded.substring(1).replace(/:\(/gi, ":!(");
    const social: Social = rison.decode_object(sub);
    if (!socialKindRuntime.has(social.kind)) {
      throw `Unknown social kind ${social.kind}`;
    }
    return social;
  } else {
    throw "All rison starts with ~ as workaround for https://github.com/mytakedotorg/mtdo/issues/355";
  }
}
