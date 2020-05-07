
var http = require('http');
var server = http.createServer();
var querystring = require('querystring');
var fs =  require('fs');

var handleFormGet = function(request, response) {
    response.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile('templates/form.html', 'utf8', function(err, data) {
      if (err) { throw err; }
      response.write(data);
      response.end();
    });
  };

server.on('request', function(request, response) {
 response.writeHead(200);
 response.write("<h1>Hello world!</h1>");
 response.end();
});

  server.listen(8888, function(){
      console.log('Listening on port 8888...')
  });