/*
 * MyTake.org website and tooling.
 * Copyright (C) 2019 MyTake.org, Inc.
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
