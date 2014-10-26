
var user = {};

$(document).ready(function() 
{ 
  $('#new-msg').keyup(function (e) 
  {
    if (e.keyCode === 13) 
    {
      var msg = {
        'user': user.nick,
        'text': $('#new-msg').val()
      };
      
      socket.emit('chat message', msg);
      $('#new-msg').val('');
    }
  });
  
  var socket = io();
  user.nick = prompt('Ingresa un nombre de usuario.');
  user.words= prompt('Ingresa un mensaje para mostrar en tu status');
  
  socket.on('chat message', function(msg) {
    
    if (msg.user === user.nick) 
    {
      var html = '<div class="panel radius msg msg-me">' +
          '<img src="http://zizaza.com/cache/icon_256/iconset/580380/580405/PNG/256/web_flat_icon/user_user_icon_user_png_flat_icon_web_icon_png_circle_icon.png" ' +
               'alt="</3" class="right user-img">' +
          '<span class="msg-autor">' + msg.user + ' Says:</span><p class="msg-text">' +
          msg.text +
          '</p></div>';
    }
    else 
    {
      var html = '<div class="panel callout radius msg">' +
          '<img src="http://zizaza.com/cache/icon_256/iconset/580380/580405/PNG/256/web_flat_icon/user_user_icon_user_png_flat_icon_web_icon_png_circle_icon.png" ' +
               'alt="</3" class="left user-img">' +
          '<span class="msg-autor">' + msg.user + ' Says:</span><p class="msg-text">' +
          msg.text +
          '</p></div>';
    }
    $('#messages').append(html);
  });
  
  socket.on('new user', function(newuser) {
    
    var html = '<div id="'+newuser.nick+'"class="online-user">' +
        '<img src="http://zizaza.com/cache/icon_256/iconset/580380/580405/PNG/256/web_flat_icon/user_user_icon_user_png_flat_icon_web_icon_png_circle_icon.png"' +
        'alt="</3" class="left user-img"> <div>' +
        '<span class="user-name">' +  newuser.nick + '</span><br>' +
        '<span class="user-words">' + newuser.words + '</span></div></div>';
    $('#online_users-list').append(html);
  });
  
  socket.on('users list', function (users) {
    for (var i=0; i < users.length; i++) 
    {
      var html = '<div id="'+users[i].nick+'" class="online-user">' +
          '<img src="http://zizaza.com/cache/icon_256/iconset/580380/580405/PNG/256/web_flat_icon/user_user_icon_user_png_flat_icon_web_icon_png_circle_icon.png"' +
          'alt="</3" class="left user-img"> <div>' +
          '<span class="user-name">' +  users[i].nick + '</span><br>' +
          '<span class="user-words">' + users[i].words + '</span></div></div>';
      $('#online_users-list').append(html);
    }
  });
  
  socket.on('rem user', function (nick) {
    console.log('User ' + nick + ' disconeected');
    $('#' + nick).remove();
  });
  
  console.log(user);
  socket.emit('new user', user);
});