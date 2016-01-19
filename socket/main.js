var socket = require('socket.io'),
  utility = require("./utility"),
  roomManager = require("./roomManager"),
  env = {
		allUser : {},
		allRooms : []
	};

exports.listen = function(app) {
  io = socket.listen(app);
  io.sockets.on('connection', function (socket) {
    console.log("connect");
    roomManager.env = env;

    socket.emit("askUserInfo",  { socket_id: socket.id, onlineNum : Object.keys(env.allUser).length + 1 });

    //When User Connect to Socket.IO
  	socket.on('loginInfo', function (data) {
        data = JSON.parse(data);
        env.allUser[socket.id] = {
          "_id" : data.id,
          "socket_id" : socket.id,
          "name" : data.name
        };
  	});

    socket.on('findRoom', function (data) {
      roomManager.findRoom(env.allUser[socket.id], function(isValid, resultArray) {
        //0=roomID, 1=room_index, 2=status
        if (isValid) {

          socket.join(resultArray[0]);
          env.allUser[socket.id].room_id = resultArray[0];
          env.allUser[socket.id].room_index = resultArray[1];

          if (resultArray[2] === "opponent") {
            console.log("Room Ready");
            socket.emit("prepareGame", {stage : ""});
            socket.to(resultArray[0]).emit('prepareGame', {stage : ""});
            env.allRooms.splice(resultArray[1], 1);
          }
        }
      });
    });

    socket.on('startBattle', function (data) {

    });

    socket.on('disconnect', function () {
      console.log("disconnect");
  		var user = env.allUser[socket.id];
      console.log(user);
      if ("room_index" in user && env.allRooms.length > user.room_index &&
         (env.allRooms[user.room_index][0] == user.room_id )) {
          env.allRooms.splice(user.room_index, 1);
          roomManager.leaveRoom(user.room_id, socket);
      }

      delete env.allUser[socket.id];
    });

  });
}
