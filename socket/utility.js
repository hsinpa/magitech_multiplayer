var request = require('request'),

utility = {
  RollDice : function() {
      return Math.floor((Math.random() * 1.5) );
  },

  GetCustomerSimulateData : function(villagerNum, callback ) {
    request('http://api.magitech.mvalero.net:3333/v1/simulations/'+villagerNum,
     function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(JSON.parse(body));
      }
    });
  }
}

module.exports = utility;
