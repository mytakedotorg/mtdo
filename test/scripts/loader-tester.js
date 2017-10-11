/**
 * Script for debugging loaders in the console
 * 
 * 
 * node test/scripts/loader-tester.js
 * 
 *   or for large input files
 * 
 * node  test/scripts/loader-tester.js > output.json
 * 
 *   and use a text editor with a JSON auto-formatter
 * 
 * TODO:
 *   - add loader file and test file as command line arguments
 *   - watch for changes in ./loaders/src, 
 *     compile .ts files to .js, 
 *     and rerun this script
 */
var loader = require(__dirname + "/../../loaders/dist/foundation-loader.js");
var fs = require("fs");
var file = __dirname + "/../../src/foundation/bill-of-rights.foundation.html";

console.log(loader(fs.readFileSync(file).toString()));
