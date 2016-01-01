module.exports = function(casper, magazine, magazineUrl) {
  var count = 0;

  casper.thenOpen(magazineUrl);

  casper.wait(1000).then(function() {
    this.echo(this.getCurrentUrl());
  });

  var urls = [];

  casper.then(function() {
    count = this.evaluate(function() {
      var num;
      $('.magazine-metric > span').each(function(idx, elem) {
        if ($(elem).html().indexOf('Article') > -1) {
          num = parseInt($(elem).html().split(' ')[0], 10);
        }
      });
      return num;
    });
  });

  function getUrls() {
    return casper.evaluate(function() {
      var items = [];
      $('.page-content .post.item').each(function(idx, item) {
        var url = $(item).find('.image-container > img').attr('src');
        try {
          items.push({
            url: url,
            filename: url.match(/^(.*)\/([^\.]*\.\w*)$/)[2]
          });
        } catch (e) {
          console.error('Failed with:', url);
        }
      });
      return items;
    });
  }

  var ready = false;

  function scrollTime(numUrls) {
    var curNum = getUrls().length;
    console.log('URLS:', numUrls, curNum);
    if (numUrls === curNum) {
      ready = true;
      return;
    }
    casper.scrollToBottom();
    setTimeout(function() {
      scrollTime(curNum);
    }, 4000);
  }

  // the set timeout keeps adding on until it hits limit

  casper.then(function() {
    scrollTime(0);
  });

  casper.waitFor(function() {
    return ready;
  }, function () {
    var urls = getUrls();
    this.echo(urls);
    this.each(urls, function(self, url) {
      self.download(url.url, 'images' + '/' + magazine + '/' + url.filename);
    });
  });

};
