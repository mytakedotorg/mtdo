interface WordTimeMap {
  word: string;
  timestamp: string;
}

module.exports = function(source: string) {
  const sourceArr: string[] = source.split("\n\n");
  let wordTimeMaps: WordTimeMap[] = [];

  for (let i = 1; i < sourceArr.length; i++) {
    const block = sourceArr[i];
    const lines = block.split("\n");
    for (const line of lines) {
      if (line.indexOf("-->") !== -1) {
        // Found an arrow, don't parse this line
        continue;
      }

      let isWord = true;
      let isTimestamp = false;
      let word = "";
      let timestamp = "";
      for (const char of line) {
        if (char === "<") {
          isWord = false;
          isTimestamp = true;
        }
        if (isWord) {
          word += char;
          continue;
        } else if (isTimestamp) {
          if (char === "c") {
            //Ran into a break character
            //this isn't a timestamp so clear timestamp variable
            timestamp = "";
            //Set isTimestamp to false until < character is found
            isTimestamp = false;
            continue;
          } else if (char === ">") {
            //Reached end of timestamp, push into map
            wordTimeMaps.push({
              word: word,
              timestamp: timestamp
            });
            //Reinitialize all variables
            isWord = true;
            isTimestamp = false;
            word = "";
            timestamp = "";
            continue;
          } else if (char != "<") {
            timestamp += char;
            continue;
          }
        } else if (char === ">") {
          isWord = true;
          isTimestamp = false;
          continue;
        }
      }
    }
  }

  const output: string = JSON.stringify(wordTimeMaps);

  return output;
};
