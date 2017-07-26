var htmlparser = require('htmlparser2');

module.exports = function (source) {
  var output = "";
  var tagIsOpen = false;

  var parser = new htmlparser.Parser({
    onopentagname: function(name, attribs) {
      if(tagIsOpen){
        throw "*.foundation.html files cannot have nested HTML tags";
      }
      tagIsOpen = true;
      var offset = output.length + name.length + 13;
      for(var i = 2; i < offset.toString().length; i++){
        offset++;
      }
      output += '<' + name + ' data="' + offset.toString() + '">';
    },
    ontext: function(text) {
      text = text.replace(new RegExp(/\r?\n|\r/g), ' '); //replace all newlines with spaces
      output += text;
    },
    onclosetag: function(name) {
      tagIsOpen = false;
      output += '</' + name + '>';
    },
    onerror: function(error) {
      throw error;
    }
  })

  parser.write(source);
  parser.end();
  
  return output;
}
