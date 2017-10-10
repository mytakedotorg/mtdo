module.exports = function(source: string) {
  const sourceArr: string[] = source.split("\n");
  let output = "";
  for (let lineIdx in sourceArr) {
    if (parseInt(lineIdx) % 3 === 0) {
      const data = sourceArr[lineIdx];

      // Parse data string in form H:MM:SS.SSS,H:MM:SS.SSS
      const startH = parseInt(data.split(",")[0].split(":")[0]);
      const startMM = parseInt(data.split(",")[0].split(":")[1]);
      const startSS = parseInt(data.split(",")[0].split(":")[2].split(".")[0]);

      const endH = parseInt(data.split(",")[1].split(":")[0]);
      const endMM = parseInt(data.split(",")[1].split(":")[1]);
      const endSS = parseInt(data.split(",")[1].split(":")[2].split(".")[0]);

      // Convert HMMSS to seconds
      const startTime = startH * 60 * 60 + startMM * 60 + startSS;
      const endTime = endH * 60 * 60 + endMM * 60 + endSS;

      // Get the script
      const script = sourceArr[parseInt(lineIdx) + 1];

      // Append a separator and a character count offset
      let dataValue = startTime.toString() + "|" + endTime.toString() + "|";

      // Character count offset
      let offset = dataValue.length + 10 + output.length;
      offset += offset.toString().length;

      dataValue += offset.toString();

      output += '<p data="' + dataValue + '">' + script + "</p>";
    }
  }

  return output;
};
