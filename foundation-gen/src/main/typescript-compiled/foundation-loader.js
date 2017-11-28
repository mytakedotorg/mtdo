var htmlparser = require("htmlparser2");
module.exports = function (source) {
    var output = [];
    var tagIsOpen = false;
    var component;
    var innerHTML;
    var parser = new htmlparser.Parser({
        onopentagname: function (name, attribs) {
            if (tagIsOpen) {
                throw "*.foundation.html files cannot have nested HTML tags";
            }
            tagIsOpen = true;
            if (name === "p" || name === "h2" || name === "h3") {
                component = name;
            }
        },
        ontext: function (text) {
            text = text.replace(new RegExp(/\r?\n|\r/g), " "); //replace all newlines with spaces
            innerHTML = text;
        },
        onclosetag: function (name) {
            tagIsOpen = false;
            output.push({
                component: component,
                innerHTML: innerHTML
            });
        },
        onerror: function (error) {
            throw error;
        }
    });
    parser.write(source);
    parser.end();
    return JSON.stringify(output);
};
