loader = process.argv[2];
inputFile = process.argv[3];
outputFile = process.argv[4];

var fs = require("fs");
var loader = require(__dirname + "/" + loader)

var output = loader(fs.readFileSync(inputFile).toString())
fs.writeFile(outputFile, output, function(err) {
  if (err) {
    console.log(err);
  }
});
