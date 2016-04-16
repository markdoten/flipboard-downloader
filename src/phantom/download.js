var createPage = require('./util').createPage;
var processMagazine = require('./magazine');
var Workflow = require('./workflow');
var system = require('system');

var FLIPBOARD_URL = 'https://flipboard.com/@markdoten';
var MAG_URLS = {
  cool: 'cool-0ei1d3uhy',
  iphone: 'iphone-5mm7uejky',
  yachts: 'yachts-rsn27rfey'
};

var magazines;
var workflow = new Workflow(createPage());

workflow.addStep('Load signin page', function (done) {
  workflow._page.open('https://flipboard.com/signin', function (status) {
    if (status !== 'success') {
      return;
    }
    if (page.injectJs('node_modules/jquery/dist/jquery.min.js')) {
      done();
    }
  });
});

workflow.addStep('Log in', function (done) {
  workflow._page.evaluate(function() {
    var $form = $('.login-form-content');
    var $fields = $form.find('.fields');
    $fields.find('input[type=text]').val(system.args[1]);
    $fields.find('input[type=password]').val(system.args[2]);
    $form.find('button.button').click();
  });
  setTimeout(done, 5000);
});

workflow.addStep('Load magazines', function (done) {
  var page = workflow._page;

  page.open('https://flipboard.com/profile', function (status) {
    if (status !== 'success') {
      return done();
    }
    if (page.injectJs('node_modules/jquery/dist/jquery.min.js')) {
      magazines = page.evaluate(function () {
        var items = [];
        $('div[role="button"]').each(function (idx, item) {
          items.push({name: $(item).children(':last').html()});
        });
        return items;
      });
    }
    done();
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
    _path = MAG_URLS[item.name.toLowerCase()];
    console.log(item.name, _path);

    if (!_path) {
      return callback();
    }
    processing = true;
    item.url = FLIPBOARD_URL + '/' + _path;
    processMagazine(item, callback);
  }, 1000);
});

workflow.addStep('Donezo', function () {
  phantom.exit();
});

workflow.process();
