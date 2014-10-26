var app  = require('express')();
var http = require('http').Server(app);
var io   = require('socket.io')(http);

var users = [];

///////////////////////////////////////////////////////////////
// Send other files for frontend

app.get('/css/foundation.min.css', function (req, res) {
  res.sendFile(__dirname + '/views/css/foundation.min.css');
});

app.get('/css/normalize.css', function (req, res) {
  res.sendFile(__dirname + '/views/css/normalize.css');
});

app.get('/css/chat.css', function (req, res) {
  res.sendFile(__dirname + '/views/css/chat.css');
});

app.get('/js/foundation.min.js', function (req, res) {
  res.sendFile(__dirname + '/views/js/foundation.min.js');
});

app.get('/js/chatClient.js', function (req, res) {
  res.sendFile(__dirname + '/views/js/chatClient.js');
});

app.get('*', function(req, res){
  res.sendFile(__dirname + '/views/chat.html');
});

////////////////////////////////////////////////////////////////

io.on('connection', function(socket) {
  
  socket.on('chat message', function(msg) {
    io.emit('chat message', msg);
  });
  
  socket.on('new user', function(user) {
    console.log('new user connected: ' + user.nick);
    socket.broadcast.emit('new user', user);
    socket.user = user;
    users.push(user);
    socket.emit('users list', users);
  });
  
  socket.on('disconnect', function() {
    if (socket.user) {
      console.log('Some user disconnected: ' + socket.user.nick);
      socket.broadcast.emit('rem user', socket.user.nick);
      users.splice(users.indexOf(socket.user), 1);
    }
  });
  
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});