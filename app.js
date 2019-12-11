var express = require('express');

var app = express();
app.set('port', process.env.PORT || 9000);
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = app.get('port');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('./public/chatModel')
var chatModel = mongoose.model('chatmodel');
var co = require('co');
var moment = require('moment');

var uri = 'mongodb://localhost:27017/chatApp';

mongoose.connect(uri,{}, function(error) {
  if(error){
    console.log('connection failed!')
  }else{
    console.log("Database connected successfully!");
  }
});

app.use(express.static('public'));

server.listen(port, function () {
    console.log("Server listening on: http://localhost:%s", port);
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

var usernames = {};
var rooms = [];

io.sockets.on('connection', function (socket) {
    
    socket.on('adduser', function (data) {
        var username = data.username;
        var room = data.room;
        if (rooms.indexOf(room) != -1) {
            socket.username = username;
            socket.room = room;
            usernames[username] = username;
            socket.join(room);
            socket.emit('updatechat', 'SERVER', 'You are connected. Start chatting');
            socket.broadcast.to(room).emit('updatechat', 'SERVER', username + ' has connected to this room');
        } else {
            socket.emit('updatechat', 'SERVER', 'Please enter valid code.');
        }
    });
    
    socket.on('createroom', function (data) {
        var new_room = ("" + Math.random()).substring(2, 7);
        rooms.push(new_room);
        data.room = new_room;
        socket.emit('updatechat', 'SERVER', 'Your room is ready, invite someone using this ID:' + new_room);
        socket.emit('roomcreated', data);
    });

    socket.on('sendchat', function (data) {
        io.sockets.in(socket.room).emit('updatechat', socket.username, data);
        co(function* () {
            let savedData = yield new chatModel({
                "userName":socket.username,
                "roomCode":socket.room,
                "message":data
            }).save();
        })
    });
    socket.on('getChatHistory', function (data) {
        co(function* () {
            let getChatRecords = yield chatModel.find({},'userName message createdAt').sort({$createdAt:1}).exec(); 
            socket.emit('getChatRecords', getChatRecords);
        })
    });
    
    socket.on('disconnect', function () {
        delete usernames[socket.username];
        io.sockets.emit('updateusers', usernames);
        if (socket.username !== undefined) {
            socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
            socket.leave(socket.room);
        }
    });
});