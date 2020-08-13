/*
 * MyTake.org website and tooling.
 * Copyright (C) 2019-2020 MyTake.org, Inc.
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
import smoothscroll from "smoothscroll-polyfill";

// kick off the polyfill!
export const windowUtils = {
  init: () => {
    smoothscroll.polyfill();

    (window as any).YTConfig = {
      host: "https://www.youtube.com",
    };

    window.onerror = function (
      message: string,
      source?: string,
      lineno?: number,
      colno?: number,
      error?: Error
    ) {
      const msg =
        "Something went wrong. To help us figure it out, please copy and paste the information from below into an email to team@mytake.org. Thank you." +
        "\n\n" +
        "Error message: " +
        message +
        "\nURL: " +
        window.location.href +
        "\nsource: " +
        source +
        "\nsource: " +
        source +
        "\nlineno: " +
        lineno +
        "\ncolno: " +
        colno +
        "\nerror: " +
        JSON.stringify(error);
      alert(msg);
    };
    if (!String.prototype.startsWith) {
      String.prototype.startsWith = function (search: string, pos = 0) {
        return (
          this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search
        );
      };
    }
    if (!String.prototype.includes) {
      String.prototype.includes = function (search: string, start?: number) {
        "use strict";
        if (typeof start !== "number") {
          start = 0;
        }

        if (start + search.length > this.length) {
          return false;
        } else {
          return this.indexOf(search, start) !== -1;
        }
      };
    }
  },
};

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
