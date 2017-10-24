interface WordTimeMap {
  idx: number;
  word: string;
  timestamp: number;
}

function convertTimestampToSeconds(timestamp: string): number {
  // Parse data string in form HH:MM:SS.SSS
  const HH = parseInt(timestamp.split(":")[0]);
  const MM = parseInt(timestamp.split(":")[1]);
  const SS = parseInt(timestamp.split(":")[2]);

  // Convert HHMMSS to seconds
  return HH * 60 * 60 + MM * 60 + SS;
}

module.exports = function(source: string) {
  const sourceArr: string[] = source.split("\n\n");
  let wordTimeMaps: WordTimeMap[] = [];
  let idx = 0;

  let word;
  for (let i = 1; i < sourceArr.length; i++) {
    const block = sourceArr[i];
    const lines = block.split("\n");
    for (const line of lines) {
      if (line.indexOf("-->") !== -1) {
        // Found an arrow, don't parse this line
        if (word) {
          word = word.trim(); //Trim all whitespace
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

      let isWord = true;
      let isTimestamp = false;
      word = "";
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
            word = word.trim(); //Trim all whitespace
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
