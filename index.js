
const http = require('http')
const queryString = require('querystring')
const server = http.createServer()
var fs =  require('fs')
const template = require('es6-template-strings')
var contacts = []

var simpleRouter = (request) => {
  var method = request.method; 
  var path = request.url;
  var suppliedRoute = {method: method, path: path}

  var queryIndex = request.url.indexOf('?');
  if (queryIndex >= 0){
    path = request.url.slice(0, queryIndex)
  }

  var routes = [
    {method: 'GET', path: '/', handler: handleFormGet},
    {method: 'POST', path: '/', handler: handleFormPost}
  ];
  for (let i = 0; i < routes.length; i++){
    var route = routes[i]
    if(route.method === suppliedRoute.method && route.path === suppliedRoute.path){
      return route.handler;
    }
    console.log("no route")    
  }
  return null;
}


var handleFormGet = (request, response) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    fs.readFile('templates/form.html', 'utf8', function (err, data) {
      if (err) { throw err; }
      response.write(data);
      response.end();
    });
  }

var handleFormPost = (request, response) => {

  response.writeHead(200, { "Content-Type": "text/html"});

  var bodyString = '';
  request.on('data', function(data){
    console.log(`Data ${data}`)
    bodyString += data;
    console.log(`Body: ${bodyString}`)

  });

  request.on('end', function (){
    console.log(`END: ${bodyString}`)
    var post = queryString.parse(bodyString);
    response.writeHead(200, { "Content-Type": "text/html"});
    fs.readFile('templates/contacts.html', 'utf8', (err, data) =>{
      if (err) { throw err }
      var values = {
        username: post['username'],
        lastname: post['lastname']
      }
      var compiled = template(data, values)
      response.write(compiled);
      response.end();
    })
  });
}

server.on('request', function(request, response){
  var handler = simpleRouter(request)

  if (handler != null ){
    handler(request, response)
  }
  else {
    response.writeHead(404);
    response.end();
  }

});


  server.listen(8888, function(){
      console.log('Listening on port 8888...')
  });