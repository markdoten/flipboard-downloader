var createPage = require('./util').createPage;
var processMagazine = require('./magazine');
var Workflow = require('./workflow');
var system = require('system');

var MAG_URLS = {
  cool: 'cool-0ei1d3uhy',
  iphone: 'iphone-5mm7uejky',
  yachts: 'yachts-rsn27rfey'
};
var REQUESTED = system.args[3].split(',');

var magazines;
var workflow = new Workflow(createPage());

function validateRequested(name) {
  if (!REQUESTED.length) {
    return true;
  }
  return REQUESTED.indexOf(name.toLowerCase()) > -1;
}

workflow.addStep('Load signin page', function (done) {
  var page = workflow._page;
  page.open('https://flipboard.com/signin', function (status) {
    if (status !== 'success') {
      return;
    }
    if (page.injectJs('node_modules/jquery/dist/jquery.min.js')) {
      done();
    }
  });
});

workflow.addStep('Log in', function (done) {
  workflow._page.evaluate(function(args) {
    var $form = $('.login-form-content');
    var $fields = $form.find('.fields');
    $fields.find('input[type=text]').val(args[1]);
    $fields.find('input[type=password]').val(args[2]);
    $form.find('button.button').click();
  }, system.args);
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
  magazines = page.evaluate(function () {
    var items = [];
    $('.magazine-tile').each(function (idx, mag) {
      items.push({
        name: $(mag).find('h3.truncated-text').html(),
        url: 'https://flipboard.com' + $(mag).find('.section-link').attr('href')
      });
    });
    return items;
  });
});

workflow.addStep('Process magazines', function (done) {
  var _path;
  var idx = 0;
  var item;
  var processing = false;

  function callback() {
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
    console.log(item.name, item.path);

    if (!validateRequested(item.name)) {
      return callback();
    }
    processing = true;
    processMagazine(item, callback);
  }, 1000);
});

workflow.addStep('Donezo', function () {
  phantom.exit();
});

workflow.process();
