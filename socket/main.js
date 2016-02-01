var socket = require('socket.io'),
  utility = require("./utility"),
  GameManager = require("./gameManager"),
  roomManager = require("./roomManager"),
  //Store all online user, and room without player2
  env = {
		allUser : {},
		allRooms : []
	};

exports.listen = function(app) {
  var gameManager = new GameManager(), io = socket.listen(app);

  io.sockets.on('connection', function (socket) {
    console.log("connect");
    roomManager.env = env;
    env.allUser[socket.id] = {"socket_id" : socket.id};

    //Send back basic server info when user first connected
    socket.emit("OnConnect", JSON.stringify({
       socket_id: socket.id,
       onlineNum : Object.keys(env.allUser).length + 1 })
     );

    //When client discconected
    socket.on('disconnect', function () {
      console.log("disconnect");
      var user = env.allUser[socket.id];

      //If roomIndex exist && make sure allRoom will not out of array
      if (user && user.room_index !== undefined && env.allRooms.length > user.room_index) {
        //if room still exist in allRoom
          if (env.allRooms[user.room_index][0] == user.room_id ) {
            console.log("Remove Room");
            env.allRooms.splice(user.room_index, 1);
          } else {
            //if game start, then let's opponent leave the game
            roomManager.leaveRoom(user.room_id, socket);
          }
      }

      delete env.allUser[socket.id];
    });

    //=========================== Menu Click Event ==========================
    socket.on('findRoom', function (data) {
      var villagerNum = 40;
      data = JSON.parse(data);
      
      env.allUser[socket.id].hero = data.hero;
      env.allUser[socket.id]._id = data.id;
      env.allUser[socket.id].name = data.name;

      roomManager.findRoom(env.allUser[socket.id], function(isValid, resultArray) {
        //0=roomID, 1=room_index, 2=status
        if (isValid) {
          socket.join(resultArray[0]);
          env.allUser[socket.id].room_id = resultArray[0];
          env.allUser[socket.id].room_index = resultArray[1];
          gameManager.startListening(socket, env.allUser, io);
          //Start Battle when player2 and villagerInfo arrive
          if (resultArray[2] === "opponent") {

            utility.GetCustomerSimulateData(villagerNum, function(data) {
              var diceResult = utility.RollDice();
              console.log("Matching Complete");

              env.allRooms[resultArray[1]].player1.diceResult = diceResult;
              env.allRooms[resultArray[1]].player2.diceResult =  (diceResult == 0) ? 1 : 0;

              //Generate Battle Data
              var sendInfo = JSON.stringify(
                {"villagerInfo" : data,
                  "player1": env.allRooms[resultArray[1]].player1,
                  "player2": env.allRooms[resultArray[1]].player2
                }
              );

              //socket.emit("prepareGame", sendInfo);
              io.in(resultArray[0]).emit('prepareGame', sendInfo);
              env.allRooms.splice(resultArray[1], 1);
            });
          }
        }
      });
    });

  });
}
