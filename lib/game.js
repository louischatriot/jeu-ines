var Nedb = require('nedb')
  , _ = require('underscore')
  , game = {}
  ;

game.questions = new Nedb({ autoload: true, filename: 'data/questions.nedb' });

// Question add handler
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


// Next question handler
game.beginNextQuestion = function (req, res) {
  console.log('INFO - Beginning next question');
  
  var nextNumber = game.currentQuestion ? game.currentQuestion.number + 1 : 1;

  game.switchToQuestion(nextNumber, function (err) {
    if (err) {
      if (err.questionNotFound) {
        console.log('INFO - No more questions');
        return game.endGame(req, res);
      } else {
        return res.status(500).end();
      }
    }

    console.log('INFO - Beginning question #' + game.currentQuestionNumber);
    game.io.emit('question.start', game.currentQuestion);
    res.status(200).end();
  });
};


// Select a specific question and update the game's state
// callback signature is (err), err will be { questionNotFound: true } if the question can't be found
game.switchToQuestion = function (questionNumber, callback) {
  console.log('Selecting question #' + questionNumber);
  game.questions.findOne({ number: questionNumber }, function (err, question) {
    if (err) { return callback(err); }
    if (!question) {
      console.log('INFO - No question #' + questionNumber);
      return callback({ questionNotFound: true });
    }

    console.log('INFO - Switching game state to question #' + questionNumber);
    game.currentQuestion = question;
    game.currentStatus = 'ASKING';

    return callback(null);
  });
};


// End game handler
game.endGame = function (req, res) {
  console.log('INFO - Ending game');

  game.currentStatus = 'ENDED';
  game.io.emit('game.end', {});

  res.status(200).end();
};


// Keep track of player count when a player leaves
game.playerLeft = function () {
  game.players -= 1;
  console.log('INFO - A player left - ' + game.players + ' players now');
};


// Send current status to a newly joining player (represented by his socket)
// Sending it to all players if no socket is passed to the function
game.sendStatus = function (socket) {
  var fn;

  if (socket) {
    fn = socket.emit;
  } else {
    fn = game.io.emit;
  }

  fn('game.status', { currentStatus: game.currentStatus, currentQuestion: game.currentQuestion });
};


// Game initialization
game.init = function () {
  game.players = 0;
  game.currentQuestion = null;
  game.currentStatus = 'NOT_STARTED';

  console.log('INFO - Initializing game');

  // Keep track of players count and actions on client disconnection
  game.io.on('connection', function (socket) {
    game.players += 1;
    console.log('INFO - A player connected - ' + game.players + ' players now');
    socket.on('disconnect', game.playerLeft);
    
    socket.emit('game.status', {});
    //game.sendStatus(socket);
  });
};



// Interface
module.exports = function (io) {
  game.io = io;
  game.init();
  return game;
};
