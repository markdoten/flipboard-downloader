var processMagazine = require('src/magazine');
var util = require('src/casper-util');

var ROOT_URL = 'https://flipboard.com';
var magazines = [];

var casper = require('casper').create({
  clientScripts:  ['node_modules/jquery/dist/jquery.min.js'],
  userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.120 Safari/537.36',
  verbose: true,
  waitTimeout: 1000000
});

casper.start('https://flipboard.com/signin');

// Set up error handling and shim
casper.on('page.initialized', util.shim);
casper.on('remote.message', util.remoteMessage);
casper.on("page.error", util.pageError);

casper.thenEvaluate(function(user, pass) {
  console.log('Authentication');
  console.log('Username:', user);
  console.log('Password:', pass);

  var inputs = $('.login-form-content .text-input');
  $(inputs[0]).val(user);
  $(inputs[1]).val(pass);
  $('.login-form-content button[label="Sign In"]').click();
},
casper.cli.get('username'),
casper.cli.get('password'));

casper.waitForUrl(/flipboard\.com\/$/).thenOpen('https://flipboard.com/profile');

casper.wait(1000).then(function() {
  magazines = this.evaluate(function() {
    var items = [];
    $('.profile-magazines .grid-item').each(function(idx, item) {
      var magazineUrl = $(item).find('a.section-link').attr('href');
      items.push({
        name: magazineUrl.match(/\/@[a-zA-Z0-9\-]+\/([a-zA-Z0-9\-]*)\-[^-]*$/)[1],
        url: magazineUrl
      });
    });
    return items;
  });
});

casper.then(function() {
  var mags = casper.cli.get('magazines').split(',');
  this.echo(magazines);
  this.each(magazines, function(self, magazine) {
    if (mags.indexOf(magazine.name) > -1) {
      processMagazine(self, magazine.name, ROOT_URL + magazine.url);
    }
  });
});

casper.run();
