export const windowUtils = {
  init: () => {
    (window as any).YTConfig = {
      host: "https://www.youtube.com"
    };

    window.onerror = function(
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
      String.prototype.startsWith = function(search: string, pos = 0) {
        return (
          this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search
        );
      };
    }
    if (!String.prototype.includes) {
      String.prototype.includes = function(search: string, start?: number) {
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
  }
};
