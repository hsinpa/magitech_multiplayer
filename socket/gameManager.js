
function GameManager(p_socket) {
  this.socket = p_socket
}

GameManager.prototype.listen = function() {
  //========================== Individual Event =====================
  this.socket.on('InventoryUpdate', function (data) {

  });
  this.socket.on('SaleSpellCasting', function (data) {

  });
  this.socket.on('EndTurn', function (data) {

  });

  //========================== Global Event =====================
  this.socket.on('EndRound', function (data) {

  });

  this.socket.on('GameEnd', function (data) {

  });

  this.socket.on('Abort', function (data) {

  });
};

module.exports = GameManager;
