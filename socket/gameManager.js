function GameManager() {
}

GameManager.prototype.startListening = function(socket, allUser, io) {
  console.log("Listen Start");
  var self = this;
  //========================== Individual Event =====================
  //Purchase product / hire labour(machine)
  socket.on('InventoryUpdate', function (data) {
    socket.to(allUser[socket.id].room_id).emit('OnInventoryUpdate', data);
  });

  //Sale product or cast spell
  socket.on('SaleSpellCasting', function (data) {
    socket.to(allUser[socket.id].room_id).emit('OnSaleSpellUpdate', data);
  });

  //End turn click event
  socket.on('EndTurn', function (data) {
    console.log("End turn :" + data)
    socket.to(allUser[socket.id].room_id).emit('OnEndTurn', data);
  });

  //========================== Global Event =====================
  //Synchronize both player's data, for reconnection/stability
  socket.on('Synchronize', function (data) {

  });

  //End Game under normal procedure
  socket.on('GameEnd', function () {
    socket.leave(allUser[socket.id].room_id);
    self.stopListening(socket);
  });

  //quit game manually
  socket.on('Abort', function () {
    console.log("Abort");

    socket.to(allUser[socket.id].room_id).emit('OnAbort');
    socket.leave(allUser[socket.id].room_id);
    self.stopListening(socket);
  });
};

//Remove all event listner in this class
GameManager.prototype.stopListening = function(socket) {
  socket.removeAllListeners('InventoryUpdate');
  socket.removeAllListeners('SaleSpellCasting');
  socket.removeAllListeners('EndTurn');
  socket.removeAllListeners('EndRound');
  socket.removeAllListeners('Abort');
  socket.removeAllListeners('GameEnd');
};

module.exports = GameManager;
