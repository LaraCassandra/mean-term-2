const http = require("http");
const queryString = require("querystring");
const server = http.createServer();
var fs = require("fs");
const template = require("es6-template-strings");
const moment = require("moment");

var loggedInUsers = [];

var databaseOfUser = [
  {
    username: "Lara",
    password: "123",
  },
  {
    username: "David",
    password: "123",
  },
];

var timeStamp = moment();

//
//
//
//Socket io
var io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  io.emit("clientConnected", "You have connected to the chat server!");

  socket.on("chatroom", (message) => {
    console.log(`This was a message from chatroom: ${message}`);
    var emoji = "&#128522;";
    var res = message.replace(":)", emoji);
    io.emit("chatroom", res);
  });
});

var simpleRouter = (request) => {
  var method = request.method;
  var path = request.url;

  //Strip the query from the ? character
  var queryIndex = request.url.indexOf("?");
  if (queryIndex >= 0) {
    path = request.url.slice(0, queryIndex);
  }

  var suppliedRoute = { method: method, path: path };
  var routes = [
    { method: "GET", path: "/", handler: handleFormGet },
    { method: "GET", path: "/login", handler: handleLoginGet },
    { method: "POST", path: "/login", handler: handleLoginPost },
    { method: "GET", path: "/socket.io.js", handler: handleSocketGet },
    { method: "POST", path: "/", handler: handleFormPost },
  ];

  //Match the supplied route with the route visited
  for (let i = 0; i < routes.length; i++) {
    var route = routes[i];
    if (
      route.method === suppliedRoute.method &&
      route.path === suppliedRoute.path
    ) {
      return route.handler;
    }
    //console.log("no route");
  }
  return null;
};

//
//
//
//Functions to handle GET requests
var handleFormGet = (request, response) => {
  response.writeHead(200, { "Content-Type": "text/html" });
  fs.readFile("templates/login.html", "utf8", function (err, data) {
    if (err) {
      throw err;
    }
    response.write(data);
    response.end();
  });
};

var handleSocketGet = function (request, response) {
  response.writeHead(200, { "Content-Type": "text/html" });
  fs.readFile("js/socket.js", "utf8", function (err, data) {
    if (err) {
      throw err;
    }
    response.write(data);
    response.end();
  });
};

//
//
//
//Functions to handle POST requests
var handleFormPost = (request, response) => {
  response.writeHead(200, { "Content-Type": "text/html" });

  var bodyString = "";
  request.on("data", function (data) {
    //console.log(`Data ${data}`)
    bodyString += data;
    //console.log(`Body: ${bodyString}`)
  });

  request.on("end", function () {
    //console.log(`END: ${bodyString}`)
    var post = queryString.parse(bodyString);
    response.writeHead(200, { "Content-Type": "text/html" });
    fs.readFile("templates/contacts.html", "utf8", (err, data) => {
      if (err) {
        throw err;
      }
      var values = {
        username: post["username"],
      };
      var compiled = template(data, values);
      response.write(compiled);
      response.end();
    });
  });
};

//
//
//
// Login Functions
var handleLoginGet = (request, response) => {
  response.writeHead(200, { "Content-Type": "text/html" });
  fs.readFile("templates/login.html", "utf8", function (err, data) {
    if (err) {
      throw err;
    }
    response.write(data);
    response.end();
  });
};

var handleLoginPost = (request, response) => {
  response.writeHead(200, { "Content-Type": "text/html" });

  var bodyString = "";
  request.on("data", (data) => {
    console.log(`Data ${data}`);
    bodyString += data;
    //console.log(`Body: ${bodyString}`);
  });

  request.on("end", function () {
    //console.log(`END: ${bodyString}`)
    var post = queryString.parse(bodyString);

    var foundUser = false;
    var inLoggedIn = false;

    for (dbUser of databaseOfUser) {
      if (
        dbUser.username === post.username &&
        dbUser.password === post.password
      ) {
        foundUser = true;

        loggedInUsers.forEach((u) => {
          if (u.username === post.username) {
            inLoggedIn = true;
          }
        });
        if (!inLoggedIn) {
          loggedInUsers.push(post);
        }
        response.writeHead(200, { "Content-Type": "text/html" });
        fs.readFile("templates/dashboard.html", "utf8", (err, data) => {
          if (err) {
            throw err;
          }
          var values = {
            username: post["username"],
            loggedUser: listLoginUsers(loggedInUsers),
          };
          var compiled = template(data, values);
          response.write(compiled);
          response.end();
        });
      }
    }
    if (!foundUser) {
      response.writeHead(404, { "Content-Type": "text/html" });
      fs.readFile("templates/404.html", "utf8", (err, data) => {
        if (err) {
          throw err;
        }
        var values = {
          username: post["username"],
        };
        var compiled = template(data, values);
        response.write(compiled);
        response.end();
      });
    }
  });
};

const listLoginUsers = (loggedUser) => {
  var list = "";
  for (user of loggedUser) {
    list += `<li>
            <h4>${user.username}</h4>
          </li>`;
  }
  return list;
};

//
//
//
//Call the 'on' method on the server
server.on("request", function (request, response) {
  var handler = simpleRouter(request);

  if (handler != null) {
    handler(request, response);
  } else {
    response.writeHead(404);
    response.end();
  }
});

server.listen(8888, function () {
  console.log("Listening on port 8888...");
});
