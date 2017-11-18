var loader = function (source) {
    var sourceArr = source.split("\n\n");
    var output = "";
    var word;
    for (var i = 1; i < sourceArr.length; i++) {
        var block = sourceArr[i];
        var lines = block.split("\n");
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.indexOf("-->") !== -1) {
                // Found an arrow, don't parse this line
                if (word) {
                    word = word.trim(); //Trim all whitespace
                    output += word + " ";
                }
                continue;
            }
            var isWord = true;
            var isTimestamp = false;
            word = "";
            var timestamp = "";
            for (var _a = 0, line_1 = line; _a < line_1.length; _a++) {
                var char = line_1[_a];
                if (char === "<") {
                    isWord = false;
                    isTimestamp = true;
                }
                if (isWord) {
                    word += char;
                    continue;
                }
                else if (isTimestamp) {
                    if (char === "c") {
                        //Ran into a break character
                        //Set isTimestamp to false until < character is found
                        isTimestamp = false;
                        continue;
                    }
                    else if (char === ">") {
                        //Reached end of timestamp, push into map
                        word = word.trim(); //Trim all whitespace
                        output += word + " "; //Append a single space
                        //Reinitialize all variables
                        isWord = true;
                        isTimestamp = false;
                        word = "";
                        continue;
                    }
                    else if (char != "<") {
                        continue;
                    }
                }
                else if (char === ">") {
                    isWord = true;
                    isTimestamp = false;
                    continue;
                }
            }
        }
    }
    return output;
};
//var loader = require(__dirname + "/getPlainTextFromVTT.js");
var fs = require("fs");
var file = __dirname + "/../../src/foundation/trump-hillary-2.vtt";
console.log(loader(fs.readFileSync(file).toString()));
// Regex for matching first "Mr. President:" and similar directives:  ^[a-zA-Z.]+\s[a-zA-Z]+:\s
