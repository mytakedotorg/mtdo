var htmlparser = require("htmlparser2");

interface FoundationComponent {
  component: "p" | "h2" | "h3";
  innerHTML: string;
}

module.exports = function(source: string) {
  var output: FoundationComponent[] = [];
  var tagIsOpen = false;

  let component: "p" | "h2" | "h3";
  let innerHTML: string;
  var parser = new htmlparser.Parser({
    onopentagname: function(name: string, attribs: any) {
      if (tagIsOpen) {
        throw "*.foundation.html files cannot have nested HTML tags";
      }
      tagIsOpen = true;
      if (name === "p" || name === "h2" || name === "h3") {
        component = name;
      }
    },
    ontext: function(text: string) {
      text = text.replace(new RegExp(/\r?\n|\r/g), " "); //replace all newlines with spaces
      innerHTML = text;
    },
    onclosetag: function(name: string) {
      tagIsOpen = false;
      output.push({
        component: component,
        innerHTML: innerHTML
      });
    },
    onerror: function(error: Error) {
      throw error;
    }
  });

  parser.write(source);
  parser.end();

  return JSON.stringify(output);
};
