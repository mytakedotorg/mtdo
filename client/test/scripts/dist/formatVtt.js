"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var query = require("cli-interact").getYesNo;
var vttFile = __dirname + "/../src/vttFiles/trump-hillary-2.vtt";
var transcriptFile = __dirname + "/../src/transcripts/trump-hillary-2.txt";
var outputFile = __dirname + "/../src/output/trump-hillary-2.vtt";
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/ /g, "-") //replace spaces with hyphens
        .replace(/[-]+/g, "-") //replace multiple hyphens with single hyphen
        .replace(/[^\w-]+/g, ""); //remove non-alphanumics and non-hyphens
}
var vttReader = function (vtt, script, skipCount) {
    var vttArr = vtt.split("\n\n");
    var scriptArr = script.replace(/\n\n/g, " ").split(" ");
    var scriptIdx = 0;
    var output = "";
    var word;
    for (var i = 1; i < vttArr.length; i++) {
        var block = vttArr[i];
        var lines = block.split("\n");
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.indexOf("-->") !== -1) {
                // Found an arrow, don't parse this line
                output += line + "\n";
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
                    if (word) {
                        var scriptWord = scriptArr[scriptIdx];
                        scriptIdx++;
                        var vttSlug = slugify(word.trim());
                        var transcriptSlug = slugify(scriptWord.trim());
                        if (vttSlug === transcriptSlug) {
                            output += scriptWord;
                        }
                        else {
                            if (skipCount === 0) {
                                console.log(output);
                                console.log("\n\n");
                                console.log("vtt: " + word);
                                console.log("transcript: " + scriptWord);
                                var answer = query("1: Replace vtt word with trascript word?");
                                if (answer) {
                                    output += scriptWord;
                                }
                                else {
                                    output +=
                                        "\n\n" +
                                            vttArr.slice(i + 1, vttArr.length - 1).join("\n\n");
                                    return output;
                                }
                            }
                            else {
                                output += scriptWord;
                                skipCount--;
                            }
                        }
                        word = "";
                    }
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
                        output += char;
                        continue;
                    }
                    else if (char === ">") {
                        output += char;
                    }
                    else {
                        output += char;
                        continue;
                    }
                }
                else if (char === ">") {
                    isWord = true;
                    isTimestamp = false;
                    output += char;
                    continue;
                }
            }
            output += "\n\n";
        }
    }
    return output;
};
var vttString = fs.readFileSync(vttFile).toString();
var transcriptString = fs.readFileSync(transcriptFile).toString();
var skipCount = parseInt(process.argv[2]);
if (!skipCount) {
    skipCount = 0;
}
var output = vttReader(vttString, transcriptString, skipCount);
fs.writeFile(outputFile, output, function (err) {
    if (err) {
        console.log(err);
    }
    console.log("file saved");
});
