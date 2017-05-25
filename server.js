var http = require('http');
var static = require('node-static');

var server = new static.Server('./public');

http.createServer(function(request, response) {
  request.addListener('end', function() {
    server.serve(request, response);
  }).resume();
}).listen(parseInt(process.env.LEANCLOUD_APP_PORT || '3000'));
