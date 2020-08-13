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
export function convertSecondsToTimestamp(totalSeconds: number): string {
  let truncated = totalSeconds | 0;

  const hours = Math.floor(truncated / 3600);
  const HH = Math.floor(truncated / 3600).toString();

  truncated %= 3600;

  const seconds = truncated % 60;
  const SS = zeroPad(seconds);

  const minutes = Math.floor(truncated / 60);

  let MM;
  if (hours > 0) {
    MM = zeroPad(minutes);
    return HH + ":" + MM + ":" + SS;
  } else if (minutes > 0) {
    MM = minutes.toString();
    return MM + ":" + SS;
  } else {
    return "0:" + seconds.toString();
  }
}

function zeroPad(someNumber: number): string {
  if (someNumber == 0) {
    return "00";
  }

  let twoDigitStr: string;
  if (someNumber < 10) {
    twoDigitStr = "0" + someNumber.toString();
  } else {
    twoDigitStr = someNumber.toString();
  }
  return twoDigitStr;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-") //replace spaces with hyphens
    .replace(/[-]+/g, "-") //replace multiple hyphens with single hyphen
    .replace(/[^\w-]+/g, ""); //remove non-alphanumics and non-hyphens
}

function getCookieValue(a: string): string {
  // https://stackoverflow.com/questions/5639346/what-is-the-shortest-function-for-reading-a-cookie-by-name-in-javascript?noredirect=1&lq=1
  const b = document.cookie.match("(^|;)\\s*" + a + "\\s*=\\s*([^;]+)");
  if (b) {
    const c = b.pop();
    return c ? c : "";
  }
  return "";
}
export function getUserCookieString(): string {
  return getCookieValue("loginui");
}
export function copyToClipboard(text: string): boolean {
  const textArea = document.createElement("textarea");
  textArea.style.position = "fixed";
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.width = "2em";
  textArea.style.height = "2em";
  textArea.style.padding = "0";
  textArea.style.border = "none";
  textArea.style.outline = "none";
  textArea.style.boxShadow = "none";
  textArea.style.background = "transparent";
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    const success = document.execCommand("copy");
  } catch (err) {
    throw "Unable to copy text";
  }
  document.body.removeChild(textArea);
  return true;
}
export function getUsernameFromURL(): string {
  return window.location.pathname.split("/")[1];
}
export function isLoggedIn(): boolean {
  return getUserCookieString() ? true : false;
}
