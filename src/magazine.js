var moment = require('moment');
var util = require('./util');
var Workflow = require('./workflow');

var articles = 0;
var currentTime = moment();
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

  console.log('\n=====================================================');
  console.log('name:          ', magazine.name);
  console.log('articles:      ', count);
  console.log('last processed:', magazine.lastProcessed);
  console.log('=====================================================\n');
});

workflow.addStep('Find all images', function (done) {
  var $img;
  var newImages;
  var page = workflow._page;
  var processed = {};
  var processing = false;
  var scrolled = false;

  var lastProcessed = magazine.lastProcessed ? 
    util.getDaysFromNow(moment(magazine.lastProcessed), currentTime) :
    null;

  var interval = setInterval(function () {
    if (processing) {
      return;
    }

    processed = page.evaluate(function (lastProcessed) {
      function getImgPath(path) {
        path = path.split('?')[0];
        return path.replace(/_(250|500)\.([a-z]{3,})$/, '_1280.$2');
      }

      var articles = 0;
      var $gridItem;
      var imgs = [];
      var sel = window.lastImg ?
        $(window.lastImg).parents('.grid-item').nextAll() :
        $('.grid-item');

      sel.each(function (idx, gridItem) {
        articles++;

        $gridItem = $(gridItem);

        $gridItem.find('.editor-item-tile-body img').each(function (idx, item) {
          $img = $(item);

          var date = $gridItem.find('.editor-item-tile-created-date').html();
          var matches = date.match(/(\d*)(s|m|h|d)$/);

          if (lastProcessed && matches[2] === 'd' && parseInt(matches[1], 10) > lastProcessed) {
            return;
          }

          imgs.push({
            height: $img.attr('height'),
            src: getImgPath($img.attr('src')),
            width: $img.attr('width')
          });
          window.lastImg = $img[0];
        });
      });

      return {
        articles: articles,
        images: imgs
      };
    }, lastProcessed);

    articles += processed.articles;
    newImages = processed.images;

    console.log('New Images:', newImages.length);

    if (!newImages.length) {
      console.log('\n=======================');
      console.log('total images:  ', images.length);
      console.log('total articles:', articles);
      console.log('=======================');

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
  var len = images.length;
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

    if (idx === len) {
      clearInterval(interval);
      return done();
    }

    item = images[idx];

    if (!item) {
      return callback();
    }
    processing = true;
    console.log('Downloading', idx + 1, 'of', len);
    util.download(item, dest, callback);
  }, 1000);
});

module.exports = function (mag, done) {
  articles = 0;
  images = [];
  magazine = mag;
  workflow.setPage(util.createPage());
  workflow.process(done);
};
