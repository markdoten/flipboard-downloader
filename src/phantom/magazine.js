var combine = require('mout/array/combine');
var util = require('./util');
var Workflow = require('./workflow');

var images = [];
var magazine;
var workflow = new Workflow();

workflow.addStep('Load magazine', function (done) {
  workflow._page.open(magazine.url, function (status) {
    if (status !== 'success') {
      return done();
    }
    if (workflow._page.injectJs('node_modules/jquery/dist/jquery.min.js')) {
      setTimeout(done, 5000);
    }
  });
});

workflow.addStep('Show stats', function () {
  var count = workflow._page.evaluate(function () {
    return $('.magazine-stats > li:first > .value').html();
  });

  console.log('\n\n\n=====================================================');
  console.log('name:    ', magazine.name);
  console.log('articles:', count);
  console.log('=====================================================\n');
});

workflow.addStep('Find all images', function (done) {
  var $img;
  var newImages = [];
  var page = workflow._page;
  var prevLen = 0;
  var processing = false;
  var scrolled = false;

  var interval = setInterval(function () {
    if (processing) {
      return;
    }

    prevLen = newImages.length;
    newImages = page.evaluate(function () {
      function getImgPath(path) {
        path = path.split('?')[0];
        return path.replace(/_(250|500)\.([a-z]{3,})$/, '_1280.$2');
      }

      var imgs = [];
      var sel = window.lastImg ?
        $(window.lastImg).parents('.grid-item').nextAll() :
        $('.grid-item');

      sel.find('.editor-item-tile-body img').each(function (idx, item) {
        $img = $(item);
        imgs.push({
          height: $img.attr('height'),
          src: getImgPath($img.attr('src')),
          width: $img.attr('width')
        });
        window.lastImg = $img[0];
      });

      return imgs;
    });

    console.log('New Images:', newImages.length);

    if (!newImages.length) {
      console.log('Total Images:', images.length);
      clearInterval(interval);
      return done();
    }

    processing = true;
    images = images.concat(newImages);

    setTimeout(function () {
      page.evaluate(function () {
        window.scrollTo(0, document.body.scrollHeight);
      });
      scrolled = true;
    }, 1000);

    setTimeout(function () {
      processing = false;
      scrolled = false;
    }, 10000);
  }, 1000);
});

workflow.addStep('Process images', function (done) {
  var dest = 'images/' + magazine.name;
  var idx = 0;
  var item;
  var page = workflow._page;
  var processing = false;

  function callback() {
    processing = false;
    idx++;
  }

  var interval = setInterval(function () {
    if (processing) {
      return;
    }

    if (idx === images.length) {
      clearInterval(interval);
      return done();
    }

    item = images[idx];

    if (!item) {
      return callback();
    }
    processing = true;
    util.download(item, dest, callback);
  }, 1000);
});

module.exports = function (mag, done) {
  images = [];
  magazine = mag;
  workflow.setPage(util.createPage());
  workflow.process(done);
};
