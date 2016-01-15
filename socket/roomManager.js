var crypto = require('crypto'),

roomManager = {
  env : {},
  findRoom : function(id, callback) {
    var room = this.env.allRooms, roomLength = this.env.allRooms.length;

    //Join room as second player
    for (var i = roomLength - 1; i >= 0; i--) {
        if (room[i][2] === "") {
          if (room[i][1] != id) {
            room[i][2] = id;
            return callback(true, [room[i].room_id, i, "opponent"]);
        } else {
          //if repeat user_id
          return callback(false,[]);
        }
      }
    }

    //Create Room name with sha1 and date
    var shaString = crypto.createHash('sha1').update(new Date().toJSON()).digest('hex');
    room[roomLength] = {
      room_id : shaString,
      player1_id : id,
      player2_id : ""
    }

    return callback(true, [shaString, roomLength, "owner"]);
  },

  //Broadcast user in the same room to leave
  leaveRoom : function(roomId, socket) {
    socket.to(roomId).emit('userDisconnect');
  },


}

module.exports = roomManager;
