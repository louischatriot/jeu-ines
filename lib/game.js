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

game.beginNextQuestion = function (req, res) {
  if (game.currentQuestion === undefined) { game.currentQuestion = 0; }
  game.currentQuestion += 1;
  console.log('INFO - Beginning next question - #' + game.currentQuestion);

  game.io.emit('question', { currentQuestion: game.currentQuestion });
  res.status(200).end();
};

game.playerLeft = function () {
  game.players -= 1;
  console.log('INFO - A player left - ' + game.players + ' players now');
};

game.init = function () {
  game.players = 0;

  console.log('INFO - Initializing game');

  game.io.on('connection', function (socket) {
    game.players += 1;
    console.log('INFO - A player connected - ' + game.players + ' players now');
    socket.on('disconnect', game.playerLeft);
  });
};



// Interface
module.exports = function (io) {
  game.io = io;
  game.init();
  return game;
};
