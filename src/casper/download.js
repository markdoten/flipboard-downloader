var processMagazine = require('./magazine');
var util = require('./casper-util');

var magazines = [];

var casper = require('casper').create({
  clientScripts:  ['node_modules/jquery/dist/jquery.min.js'],
  pageSettings: {
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4'
  },
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 8_0 like Mac OS X) AppleWebKit/600.1.3 (KHTML, like Gecko) Version/8.0 Mobile/12A4345d Safari/600.1.4',
  verbose: true,
  waitTimeout: 100000
});

casper.start('https://flipboard.com/signin');

// Set up error handling and shim
casper.on('page.initialized', util.shim);
casper.on('remote.message', util.remoteMessage);
casper.on("page.error", util.pageError);



casper.wait(1000).then(function() {
  var user = this.cli.get('username');
  var pass = this.cli.get('password');

  this.echo('Authentication');
  this.echo('Username: ' + user);
  this.echo('Password: ' + pass);

  this.fillSelectors('form.email-form', {
    'input[type="text"]': user,
    'input[type="password"]': pass
  }, true);
});

casper.waitForSelector('button[title="Go to My Flipboard"]');

casper.thenOpen('https://flipboard.com/following', function() {
  this.click('.hbox > div:nth-last-child(1)');
});

casper.then(function() {
  magazines = this.evaluate(function() {
    var items = [];
    $('.hbox + div').find('div[role="button"]').each(function(idx, item) {
      items.push({
        name: $(item).children(':last').html(),
        elem: $(item)
      });
    });
    return items;
  });
});


// casper.wait(1000).then(function() {
//   magazines = this.evaluate(function() {
//     var items = [];
//     $('.profile-magazines .grid-item').each(function(idx, item) {
//       var magazineUrl = $(item).find('a.section-link').attr('href');
//       items.push({
//         name: magazineUrl.match(/\/@[a-zA-Z0-9\-]+\/([a-zA-Z0-9\-]*)\-[^-]*$/)[1],
//         url: magazineUrl
//       });
//     });
//     return items;
//   });
// });

casper.then(function() {
  var mags = casper.cli.get('magazines').split(',');
  this.echo(mags);
  this.echo(magazines);
  this.each(magazines, function(self, magazine) {
    if (!mags.length || mags.indexOf(magazine.name.toLowerCase()) > -1) {
      processMagazine(self, magazine);
    }
  });
});

casper.run();
