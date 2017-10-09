module.exports = function (source) {
	var sourceArr = source.split("\n");
	var data = "";
	var output = "";
	for (var lineIdx in sourceArr) {
		if (lineIdx % 3 === 0) {
			data = sourceArr[lineIdx];

			// Parse data string in form H:MM:SS.SSS,H:MM:SS.SSS
			let startH = parseInt(data.split(",")[0].split(":")[0]);
			let startMM = parseInt(data.split(",")[0].split(":")[1]);
			let startSS = parseInt(data.split(",")[0].split(":")[2].split(".")[0]);

			let endH = parseInt(data.split(",")[1].split(":")[0]);
			let endMM = parseInt(data.split(",")[1].split(":")[1]);
			let endSS = parseInt(data.split(",")[1].split(":")[2].split(".")[0]);

			// Convert HMMSS to seconds
			let startTime = (startH * 60 * 60) + (startMM * 60) + startSS;
			let endTime = (endH * 60 * 60) + (endMM * 60) + endSS;

			// Get the script
			script = sourceArr[parseInt(lineIdx) + 1];

			// Append a separator and a character count offset
			let dataValue = startTime.toString() + "|" + endTime.toString() + "|";

			// Character count offset
			let offset = dataValue.length + 10 + output.length;
			offset += offset.toString().length;

			dataValue += offset.toString();

			output += '<p data="' + dataValue + '">' + script + '</p>';
		}
	}

  return output;
}
