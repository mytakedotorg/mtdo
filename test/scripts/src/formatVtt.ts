import * as fs from "fs";
let query = require('cli-interact').getYesNo;
let vttFile = __dirname + "/../src/vttFiles/trump-hillary-2.vtt";
let transcriptFile = __dirname + "/../src/transcripts/trump-hillary-2.txt";
let outputFile = __dirname + "/../src/output/trump-hillary-2.vtt";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ /g, "-") //replace spaces with hyphens
    .replace(/[-]+/g, "-") //replace multiple hyphens with single hyphen
    .replace(/[^\w-]+/g, ""); //remove non-alphanumics and non-hyphens
}

let vttReader = function(vtt: string, script: string, skipCount: number): string {
  let vttArr = vtt.split("\n\n");
	let scriptArr = script.replace(/\n\n/g, " ").split(" ");
	let scriptIdx = 0;
  let output = "";
  let word;
  for (var i = 1; i < vttArr.length; i++) {
    let block = vttArr[i];
    let lines = block.split("\n");
    for (let _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
      let line = lines_1[_i];
      if (line.indexOf("-->") !== -1) {
        // Found an arrow, don't parse this line
        output += line + "\n";
        continue;
      }
      let isWord = true;
      let isTimestamp = false;
      word = "";
      let timestamp = "";
      for (let _a = 0, line_1 = line; _a < line_1.length; _a++) {
        let char = line_1[_a];
        if (char === "<") {
          isWord = false;
					isTimestamp = true;
					if (word) {
						let scriptWord = scriptArr[scriptIdx];
						scriptIdx++;
						let vttSlug = slugify(word.trim());
						let transcriptSlug = slugify(scriptWord.trim());
						
						if (vttSlug === transcriptSlug) {
							output += scriptWord;
						} else {
							if (skipCount === 0) {
								console.log(output);
								console.log("\n\n");
								console.log("vtt: " + word);
								console.log("transcript: " + scriptWord);
								let answer = query("1: Replace vtt word with trascript word?");
								if (answer) {
									output += scriptWord;
								} else {
									output += "\n\n" + vttArr.slice(i+1, vttArr.length -1).join("\n\n");
									return output;
								}
							} else {
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
        } else if (isTimestamp) {
          if (char === "c") {
            //Ran into a break character
            //Set isTimestamp to false until < character is found
            isTimestamp = false;
            output += char;
            continue;
          } else if (char === ">") {
						output += char;
          } else {
            output += char;
            continue;
          }
        } else if (char === ">") {
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

let vttString = fs.readFileSync(vttFile).toString();
let transcriptString = fs.readFileSync(transcriptFile).toString();
let skipCount: number = parseInt(process.argv[2]);

if (!skipCount) {
	skipCount = 0;
}

let output = vttReader(vttString, transcriptString, skipCount);

fs.writeFile(outputFile, output, function(err) {
	if (err) {
		console.log(err);
	}

	console.log("file saved");
})