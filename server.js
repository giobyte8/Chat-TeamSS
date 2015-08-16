/**
 * Server.js
 * @author : DiganmeGiovanni | https://twitter.com/DiganmeGiovanni
 * @Created on: 25 Oct, 2014
 * Updated on: 15 Aug, 2015
 */


// ====================================================== //
// == MODULOS REQUERIDOS PARA LA APLICACIÓN
// ====================================================== //
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var http        = require('http').Server(app);
var io          = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;


// ====================================================== //
// == MODULOS PROPIOS DE LA APLICACIÓN
// ====================================================== //
var userDAO     = require('./dao/UserDAO').UserDAO;
var messageDAO  = require('./dao/MessageDAO').MessageDAO;


// ====================================================== //
// == MONGODB DATOS DE CONEXIÓN
// ====================================================== //
var mdbconf = {
  host: process.env.MONGODB_PORT_27017_TCP_ADDR || '172.17.0.3',
  port: '27017',
  db: 'chatSS'
};

// ====================================================== //
// == INICIALIZA LA CONEXIÓN A MONGODB Y EL SERVIDOR
// =====================================================  //
var mongodbURL = 'mongodb://' + mdbconf.host + ':' + mdbconf.port + '/' + mdbconf.db;
MongoClient.connect(mongodbURL, function (err, db) {
  
  var usersDAO = new userDAO(db);
  var messagesDAO = new messageDAO(db);
  var onlineUsers = [];
  

  app.use(bodyParser()); // Para acceder a 'req.body' en peticiones POST
  
  
// ====================================================== //
// == CONFIGURACIÓN DE RUTAS
// =====================================================  //
  app.get('/signup', function (req, res) {
    res.sendFile( __dirname + '/views/signup.html');
  });
  
  app.post('/signup', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var email    = req.body.email;
    
    usersDAO.addUser(username, password, email, function (err, user) {
      if (err) {
        res.send({ 'error': true, 'err': err});
      }
      else {
        user.password = null;
        res.send({ 'error': false, 'user': user });
      }
    });
  });

  app.post('/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    
    usersDAO.validateLogin(username, password, function (err, user) {
      if (err) {
        res.send({'error': true, 'err': err});
      }
      else {
        user.password = null;
        res.send({ 'error': false, 'user': user});
      }
    })
  });
  
  /** css and js static routes */
  app.get('/css/foundation.min.css', function (req, res) {
    res.sendFile(__dirname + '/views/css/foundation.min.css');
  });

  app.get('/css/normalize.css', function (req, res) {
    res.sendFile(__dirname + '/views/css/normalize.css');
  });
  
  app.get('/css/chat.css', function (req, res) {
    res.sendFile(__dirname + '/views/css/chat.css');
  })
  
  app.get('/js/foundation.min.js', function (req, res) {
    res.sendFile(__dirname + '/views/js/foundation.min.js');
  });
  
  app.get('/js/foundation.offcanvas.js', function (req, res) {
    res.sendFile(__dirname + '/views/js/foundation.offcanvas.js');
  });
  
  app.get('/js/chat.js', function (req, res) {
    res.sendFile(__dirname + '/views/js/chat.js');
  });
  
  app.get('/js/moment-with-locales.min.js', function (req, res) {
    res.sendFile(__dirname + '/views/js/moment-with-locales.min.js')
  })
  
  app.get('/img/nathan.png', function (req, res) {
    res.sendFile(__dirname + '/views/img/nathan.png');
  })
  
  app.get('*', function(req, res) {
    res.sendFile( __dirname + '/views/chat.html');
  });


  /** *** *** ***
   *  Configuramos Socket.IO para estar a la escucha de
   *  nuevas conexiones. 
   */
  io.on('connection', function(socket) {
    
    console.log('New user connected');
    
    /**
     * Cada nuevo cliente solicita con este evento la lista
     * de usuarios conectados en el momento.
     */
    socket.on('all online users', function () {
      socket.emit('all online users', onlineUsers);
    });
    
    /**
     * Cada nuevo socket debera estar a la escucha
     * del evento 'chat message', el cual se activa
     * cada vez que un usuario envia un mensaje.
     * 
     * @param  msg : Los datos enviados desde el cliente a 
     *               través del socket.
     */
    socket.on('chat message', function(msg) {
      messagesDAO.addMessage(msg.username, Date.now(), msg.message, function (err, nmsg) {
        io.emit('chat message', nmsg);
      });
    });
    
    /**
     * Mostramos en consola cada vez que un usuario
     * se desconecte del sistema.
     */
    socket.on('disconnect', function() {
      onlineUsers.splice(onlineUsers.indexOf(socket.user), 1);
      io.emit('remove user', socket.user);
      console.log('User disconnected');
    });
    
    /**
     * Cada nuevo cliente solicita mediante este evento
     * los ultimos mensajes registrados en el historial
     */
    socket.on('latest messages', function () {
      messagesDAO.getLatest(50, function (err, messages) {
        if (err) console.log('Error getting messages from history');
        socket.emit('latest messages', messages);
      });
    });
    
    /**
     * Cuando un cliente se conecta, emite este evento
     * para informar al resto de usuarios que se ha conectado.
     * @param  {[type]} nuser El nuevo usuarios
     */
    socket.on('new user', function (nuser) {
      socket.user = nuser;
      onlineUsers.push(nuser);
      io.emit('new user', nuser);
    });
    
  });


  /**
   * Iniciamos la aplicación en el puerto 5000
   */
  http.listen(80, function() {
    console.log('CHatSS App up and running ...');
  });
});
