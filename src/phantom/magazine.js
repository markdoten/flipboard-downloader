var createPage = require('./util').createPage;
var Workflow = require('./workflow');

var magazine;
var workflow = new Workflow();

workflow.addStep('Load magazine', function (done) {
  workflow._page.open(magazine.url, function (status) {
    if (status !== 'success') {
      return done();
    }
    if (workflow._page.injectJs('node_modules/jquery/dist/jquery.min.js')) {
      if (workflow._page.injectJs('node_modules/jquery-touchswipe/jquery.touchSwipe.min.js')) {
        done();
      }
    }
  });
});

workflow.addStep('Scroll', function () {
  var page = workflow._page;

  page.evaluate(function () {
    var $elem = $('.fill .fill .fill > div > div > div > div:last');

    $elem.trigger('swipeUp', ['up', '100', 200, 1]);//, fingerData, currentDirection]);
    
  });

  page.render(magazine.name + '.png');
});

module.exports = function (mag, done) {
  magazine = mag;
  workflow.setPage(createPage());
  workflow.process(done);
};
