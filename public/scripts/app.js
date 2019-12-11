'use strict';

var app = angular.module('myApp', []);

/* Controllers */
app.controller('AppCtrl', function ($scope, socket) {

  $scope.users = [];
  $scope.curtrentUser = '';
  $scope.isSet = false;
  socket.on('connect', function () { });

  socket.on('updatechat', function (username, data) {
    var user = {};
    user.username = username;
    user.message = data;
    user.date = new Date().getTime();
    user.image = 'http://dummyimage.com/250x250/000/fff&text=' + username.charAt(0).toUpperCase();
    $scope.users.push(user);
  });


  socket.on('getChatRecords', function (records) { 
    $scope.users = [];
var messageRecords = {};
records.forEach(function (obj) {
  messageRecords = {};
  messageRecords.username = obj.userName;
  messageRecords.message = obj.message;
  messageRecords.date  = obj.createdAt;
  messageRecords.image = 'http://dummyimage.com/250x250/000/fff&text=' + obj.userName.charAt(0).toUpperCase();
  $scope.users.push(messageRecords);
})
   
  });


  socket.on('roomcreated', function (data) {
    socket.emit('adduser', data);
  });

  $scope.createRoom = function (data) {
    $scope.curtrentUser = data.username;
    socket.emit('createroom', data);
  }

  $scope.joinRoom = function (data) {
    $scope.curtrentUser = data.username;
    socket.emit('adduser', data);
  }

  $scope.doPost = function (message) {
    $scope.isSet = true;
    socket.emit('sendchat', message);
  }

  $scope.getChatHistory = function(){
    socket.emit('getChatHistory', '')
  }
  
});


/* Services */
app.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});