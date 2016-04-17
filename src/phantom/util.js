var process = require("child_process");
var spawn = process.spawn;
var execFile = process.execFile;
var webpage = require('webpage');

/**
 * Utilities.
 * @type {Object}
 */
var util = {};

/**
 * Create a webpage instance.
 * @return {Webpage}
 */
util.createPage = function () {
  return webpage.create();
};

/**
 * [download description]
 * @param  {[type]} uri
 * @param  {[type]} dest
 * @param  {Function} callback
 * @return {[type]}
 */
util.download = function (img, dest, callback, page) {
  console.log('Downloading:', img.src);
  var parts = img.src.split('/');
  var filename = dest + '/' + parts[parts.length - 1];

  execFile('node', ['download.js', img.src, filename], null, function (err, stdout, stderr) {
    console.log("execFileSTDOUT:", JSON.stringify(stdout));
    console.log("execFileSTDERR:", JSON.stringify(stderr));
    callback();
  });
};

module.exports = util;
