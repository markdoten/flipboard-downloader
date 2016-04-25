var fs = require('fs');
var process = require('child_process');
var execFile = process.execFile;
var webpage = require('webpage');

var accessFilename = 'magazine-access.json';

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
    height: 875,
    width: 1450
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
  var parts = img.src.split('/');
  var filename = dest + '/' + parts[parts.length - 1];
  execFile('node', ['download.js', img.src, filename], null, callback);
};

/**
 * Get the days from the current time.
 * @param {moment} then - The date to compare to the current date.
 * @param {moment} now - The current date.
 * @return {number}
 */
util.getDaysFromNow = function (then, now) {
  return now.diff(then, 'days') + 1;
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

/**
 * Update the processed time of the magazine in JSON file.
 * @param {string} name - Name of the magazine that was processed.
 * @param {string} dateString - Processed time in ISO string format.
 */
util.updateProcessTime = function (name, dateString) {
  var accessJSON = JSON.parse(fs.read(accessFilename));
  accessJSON[name] = dateString;
  fs.write(accessFilename, JSON.stringify(accessJSON));
};

module.exports = util;
