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
  // page.settings.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4';
  return page;
};

module.exports = util;
