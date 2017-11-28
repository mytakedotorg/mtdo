function convertTimestampToSeconds(timestamp) {
    // Parse data string in form HH:MM:SS.SSS
    var HH = parseInt(timestamp.split(":")[0]);
    var MM = parseInt(timestamp.split(":")[1]);
    var SS = parseFloat(timestamp.split(":")[2]);
    // Convert HHMMSS to seconds
    return HH * 60 * 60 + MM * 60 + SS;
}
module.exports = function (source) {
    var sourceArr = source.split("\n\n");
    var wordTimeMaps = [];
    var idx = 0;
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
                    if (word.split(" ").length > 1) {
                        throw "Encountered word with a space in it. Index: " +
                            idx.toString() +
                            ", word: " +
                            word;
                    }
                    word += " "; //Append a single space
                    wordTimeMaps.push({
                        idx: idx,
                        word: word,
                        timestamp: convertTimestampToSeconds(line.split(" ")[0])
                    });
                    idx++;
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
                        //this isn't a timestamp so clear timestamp variable
                        timestamp = "";
                        //Set isTimestamp to false until < character is found
                        isTimestamp = false;
                        continue;
                    }
                    else if (char === ">") {
                        //Reached end of timestamp, push into map
                        word = word.trim(); //Trim all whitespace
                        if (word.split(" ").length > 1) {
                            throw "Encountered word with a space in it. Index: " +
                                idx.toString() +
                                ", word: " +
                                word;
                        }
                        word += " "; //Append a single space
                        wordTimeMaps.push({
                            idx: idx,
                            word: word,
                            timestamp: convertTimestampToSeconds(timestamp)
                        });
                        //Reinitialize all variables
                        isWord = true;
                        isTimestamp = false;
                        word = "";
                        timestamp = "";
                        idx++;
                        continue;
                    }
                    else if (char != "<") {
                        timestamp += char;
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
    var output = JSON.stringify(wordTimeMaps);
    return output;
};
