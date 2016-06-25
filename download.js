var fs = require('fs');
var request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function (err, res, body) {
    console.log('content-type:', res.headers['content-type']);
    console.log('content-length:', res.headers['content-length']);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

var uri = process.argv[2];
var filename = process.argv[3];
filename = /^\//.test(filename) ? filename : __dirname + '/' + filename;

var parts = filename.split('/');
parts.pop();
var dir = parts.join('/');

fs.mkdir(dir, function () {
  console.log('Downloading:', uri, filename);

  download(uri, filename, function () {
    console.log('done');
  });
});
