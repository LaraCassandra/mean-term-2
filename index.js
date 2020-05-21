
const http = require('http')
const queryString = require('querystring')
var fs =  require('fs')
const template = require('es6-template-strings')
const server = http.createServer()
var contacts = [];





var io = require('socket.io').listen(server)

io.on('connection', socket => {
  console.log('a user connected'),
  socket.emit('chat-message', 'Hello, you have connected to the chat server!')


  socket.on('chatroom', function(msg){
    console.log(`This is the message that was sent ${msg}`)
    var emoji = "&#128540";
    var res = msg.replace(":)", emoji)
    io.emit('chatroom', res);
  });

  socket.on('broadcast', function(msg){
    console.log(`This was the message that was sent ${msg}`)
    socket.broadcast.emit('broadcast', 'Thank you for your message');
  })

});





var simpleRouter = (request) => {
  var method = request.method; 
  var path = request.url;


  //Strip the query from the ? character
  var queryIndex = request.url.indexOf('?');
  if (queryIndex >= 0){
    path = request.url.slice(0, queryIndex)
  }


  var suppliedRoute = {method: method, path: path}
  var routes = [
    {method: 'GET', path: '/', handler: handleFormGet},
    {method: 'GET', path: '/socket.io.js', handler: handleSocketGet},
    {method: 'POST', path: '/', handler: handleFormPost}
  ];





  //Match the supplied route with the route visited
  for (let i = 0; i < routes.length; i++){
    var route = routes[i]
    if(route.method === suppliedRoute.method && route.path === suppliedRoute.path){
      return route.handler;
    }
    console.log("no route")    
  }
  return null;
}





//Function to handle GET requests
var handleFormGet = (request, response) => {
    response.writeHead(200, { "Content-Type": "text/html" });
    fs.readFile('templates/form.html', 'utf8', function (err, data) {
      if (err) { throw err; }
      response.write(data);
      response.end();
    });
  }


  var handleSocketGet = function(request, response){
    response.writeHead(200, {"Content-Type": "text/html"});
    fs.readFile('js/socket.js', 'utf8', function(err, data){
      if (err) { throw err; }
      response.write(data);
      response.end();
    })
  }





//Function to handle POST requests
var handleFormPost = (request, response) => {
  response.writeHead(200, { "Content-Type": "text/html"});
  
  var bodyString = '';
  request.on('data', function(data){
    //console.log(`Data ${data}`)
    bodyString += data;
    //console.log(`Body: ${bodyString}`)

  });

  request.on('end', function (){
    //console.log(`END: ${bodyString}`)
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





//Call the 'on' method on the server 
server.on('request', function(request, response){
  var handler = simpleRouter(request);

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