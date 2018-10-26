var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http,{pingInterval: 10000,pingTimeout:5000});
var path = require('path');
let userList = [];
const socketList = {};

app.use(express.static(__dirname + '/'));
app.get('*', function (req, res) {
  res.sendFile(__dirname + '/client.html');
});

io.on('connection', function (socket) {
  socket.on('register', function (name) {
    console.log('register ',name,socket.id);
    userList.unshift({id:socket.id,name:name,status:'on'});
    socketList[socket.id] = socket;
    io.emit('userList', userList);
  });

  socket.on('private', function (talk) {
    const toSocket = socketList[talk.to.id];
    toSocket.emit('private',talk);
  });

  socket.on('disconnect', function () {
    const user = userList && userList.filter(item => item.id === socket.id);
    const name = user && user[0] && user[0]['name'];
    console.log('user disconnected ', name,socket.id);
    userList.forEach(item=>{
      if(item.id === socket.id){
        item.status = 'off';
      }
    });
    io.emit('userList', userList);
  });
});




// var news = io
//   .of('/news')
//   .on('connection', function (socket) {
//     socket.emit('new', 'new1');
//     setTimeout(function(){
//       socket.emit('new', 'new2');
//     },30000);
//     setTimeout(function(){
//       socket.emit('new', 'new3');
//     },600000);
//   });

http.listen(3000, function () {
  console.log('listening on *:3000');
});

function randomColor() {
  return `rgb(${Math.ceil(Math.random()*255)},${Math.ceil(Math.random()*255)},${Math.ceil(Math.random()*255)})`
}