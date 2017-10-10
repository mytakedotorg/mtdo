var htmlparser = require("htmlparser2");

module.exports = function(source: string) {
  var output = "";
  var tagIsOpen = false;

  var parser = new htmlparser.Parser({
    onopentagname: function(name: string, attribs: any) {
      if (tagIsOpen) {
        throw "*.foundation.html files cannot have nested HTML tags";
      }
      tagIsOpen = true;
      var offset = output.length + name.length + 13;
      for (var i = 2; i < offset.toString().length; i++) {
        offset++;
      }
      output += "<" + name + ' data="' + offset.toString() + '">';
    },
    ontext: function(text: string) {
      text = text.replace(new RegExp(/\r?\n|\r/g), " "); //replace all newlines with spaces
      output += text;
    },
    onclosetag: function(name: string) {
      tagIsOpen = false;
      output += "</" + name + ">";
    },
    onerror: function(error: Error) {
      throw error;
    }
  });

  parser.write(source);
  parser.end();

  return output;
};
