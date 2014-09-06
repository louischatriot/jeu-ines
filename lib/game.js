var Nedb = require('nedb')
  , _ = require('underscore')
  , game = {}
  ;

game.questions = new Nedb({ autoload: true, filename: 'data/questions.nedb' });

game.addQuestion = function (req, res) {
  game.questions.find({}, { number: 1, _id: 0 }, function (err, numbers) {
    var max = numbers.length === 0 ? 0 : _.max(_.pluck(numbers, 'number'))
      , question = req.body
      ;

    question.number = max + 1;  

    game.questions.insert(req.body, function (err) {
      if (err) {
        res.status(500).end();
      } else {
        res.status(200).end();
      }
    });
  });
};

game.init = function () {
  console.log('INFO - Initializing game');

  game.io.on('connection', function (socket) {
    console.log('INFO - A player connected');

    socket.on('disconnect', function () {
      console.log('INFO - A player left');
    });
  });
};



// Interface
module.exports = function (io) {
  game.io = io;
  game.init();
  return game;
};
