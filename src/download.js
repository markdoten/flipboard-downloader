var createPage = require('./util').createPage;
var difference = require('mout/array/difference');
var forEach = require('mout/array/forEach');
var forOwn = require('mout/object/forOwn');
var keys = require('mout/object/keys');
var moment = require('moment');
var processMagazine = require('./magazine');
var Workflow = require('./workflow');
var sort = require('mout/array/sort');
var system = require('system');
var util = require('./util');

var magazineAccessArray = [];
var magazineAccess = util.getMagazineAccess();
var magazines = [];
var workflow = new Workflow(createPage());

forOwn(magazineAccess, function (val, key) {
  magazineAccessArray.push({
    name: key,
    lastProcessed: moment(val)
  });
});
magazineAccessArray = sort(magazineAccessArray, function (a, b) {
  return b.lastProcessed < a.lastProcessed;
});

var systemArgs = util.parseSystemArgs(system.args);
systemArgs.exclude = systemArgs.exclude ? systemArgs.exclude.split(',') : [];
systemArgs.mags = systemArgs.mags ? systemArgs.mags.split(',') : [];
systemArgs.output = systemArgs.output || 'images/';

if (!/\/$/.test(systemArgs.output)) {
  systemArgs.output += '/';
}

function validateRequested(name) {
  var lowerName = name.toLowerCase();
  var isExcluded = systemArgs.exclude.indexOf(lowerName) > -1;

  if (!systemArgs.mags.length && !isExcluded) {
    return true;
  }
  if (isExcluded) {
    return false;
  }
  return systemArgs.mags.indexOf(lowerName) > -1;
}

workflow.addStep('Load signin page', function (done) {
  var page = workflow._page;
  page.open('https://flipboard.com/signin', function (status) {
    if (status !== 'success') {
      return;
    }
    if (page.injectJs('node_modules/jquery/dist/jquery.min.js')) {
      setTimeout(done, 5000);
    }
  });
});

workflow.addStep('Log in', function (done) {
  workflow._page.evaluate(function(user, pass) {
    var $form = $('.login-form-content');
    var $fields = $form.find('.fields');
    $fields.find('input[type=text]').val(user);
    $fields.find('input[type=password]').val(pass);
    $form.find('button.button').click();
  }, systemArgs.user, systemArgs.pass);
  setTimeout(done, 5000);
});

workflow.addStep('Load magazines', function (done) {
  var page = workflow._page;
  page.open('https://flipboard.com/profile', function (status) {
    if (status !== 'success') {
      return;
    }
    if (page.injectJs('node_modules/jquery/dist/jquery.min.js')) {
      setTimeout(done, 5000);
    }
  });
});

workflow.addStep('Compile magazines', function () {
  var page = workflow._page;

  var mags = page.evaluate(function (magazineAccess) {
    var items = {};
    var name;
    var path;

    /**
     * Convert the magazine path to the edit path that will be used.
     * @param {string} path - The magazine path to convert.
     * @return {string}
     */
    function getMagPath(path) {
      return path.replace(/@([^\/]*).*-([^-]*)$/, 'editor/sid%252F$2%252F$1');
    }

    $('.magazine-tile').each(function (idx, mag) {
      name = $(mag).find('h3.truncated-text').html();
      path = $(mag).find('.section-link').attr('href');

      items[name] = {
        lastProcessed: magazineAccess[name],
        name: name,
        url: 'https://flipboard.com' + getMagPath(path)
      };
    });
    return items;
  }, magazineAccess);

  // Check if any are in mags and not magazineAccess
  forEach(difference(keys(mags), keys(magazineAccess)), function (val) {
    magazines.push(mags[val]);
  });

  var name;
  forEach(magazineAccessArray, function (val) {
    name = val.name;
    // Name isn't in the access list, so it must be new. Add to the front.
    if (!(name in mags)) {
      return;
    }
    magazines.push(mags[name]);
  });
});

workflow.addStep('Process magazines', function (done) {
  var _path;
  var idx = 0;
  var item;
  var processing = false;

  function callback(skipped) {
    skipped || util.updateProcessTime(item.name, moment().toISOString());
    processing = false;
    idx++;
  }

  var interval = setInterval(function () {
    if (processing) {
      return;
    }

    if (idx === magazines.length) {
      clearInterval(interval);
      return done();
    }

    item = magazines[idx];
    console.log(item.name + ':', unescape(item.url));

    if (!validateRequested(item.name)) {
      return callback(true);
    }
    processing = true;
    processMagazine({
      dest: systemArgs.output,
      done: callback,
      mag: item
    });
  }, 1000);
});

workflow.addStep('Donezo', function () {
  phantom.exit();
});

workflow.process();
