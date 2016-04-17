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
  var page = webpage.create();
  page.viewportSize = {
    height: 760,
    width: 760
  };
  return page;
};

/**
 * Download the provided image.
 * @param {Object} img - The image to download.
 * @param {string} dest - Destination folder of the download.
 * @param {function()} callback - Complete callback.
 */
util.download = function (img, dest, callback) {
  console.log('Downloading:', img.src);
  var parts = img.src.split('/');
  var filename = dest + '/' + parts[parts.length - 1];

  execFile('node', ['download.js', img.src, filename], null, function (err, stdout, stderr) {
    console.log("execFileSTDOUT:", JSON.stringify(stdout));
    console.log("execFileSTDERR:", JSON.stringify(stderr));
    callback();
  });
};

/**
 * Parse the system arguments into an object.
 * @param {Array.<string>} args - Arguments to parse.
 * @return {Object}
 */
util.parseSystemArgs = function (args) {
  var match;
  var ret = {};

  args.forEach(function (arg) {
    match = arg.match(/(\w+)=(.*)/);
    if (match) {
      ret[match[1]] = match[2];
    }
  });
  return ret;
};

module.exports = util;
