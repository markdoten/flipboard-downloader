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
      done();
    }
  });
});

workflow.addStep('Scroll', function (done) {
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
      var imgs = [];
      $('.grid-page .background-image, .photo-page .background-image').each(function (idx, item) {
        $img = $(item);
        imgs.push({
          elem: $img[0],
          height: $img.attr('height'),
          src: $img.attr('src'),
          width: $img.attr('width')
        });
      });
      return imgs;
    });

    console.log(newImages.length, prevLen);
    if (newImages.length === prevLen) {
      clearInterval(interval);
      return done();
    }

    processing = true;
    combine(images, newImages);

    setTimeout(function () {
      page.evaluate(function () {
        window.scrollTo(0, document.body.scrollHeight);
      });
      scrolled = true;
    }, 1000);

    setTimeout(function () {
      processing = !page.evaluate(function () {
        console.log('loading?', $('.load-more').length);
        return !!$('.load-more').length;
      });
      if (!processing && scrolled) {
        scrolled = false;
        return;
      }
      setTimeout(arguments.callee, 100);
    }, 100);
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
