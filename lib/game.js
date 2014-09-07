var Nedb = require('nedb')
  , _ = require('underscore')
  , async = require('async')
  , game = {}
  ;

game.questions = new Nedb({ autoload: true, filename: 'data/questions.nedb' });
game.players = new Nedb({ autoload: true, filename: 'data/players.nedb' });

// Create a new question
// #Handler
game.addQuestion = function (req, res) {
  game.questions.find({}, { number: 1, _id: 0 }, function (err, numbers) {
    var max = numbers.length === 0 ? 0 : _.max(_.pluck(numbers, 'number'))
      , question = req.body
      ;

    question.number = max + 1;
    // If possible answers were provided as answerA, answerB ..., use normalized format
    if (!question.answers) {
      question.answers = [];
      ['A', 'B', 'C', 'D'].forEach(function (answer) {
        question.answers.push({ letter: answer
                              , text: question['answer' + answer]
                              , valid: question['answer' + answer + 'Valid']
                              });
      });
    }

    game.questions.insert(req.body, function (err) {
      if (err) {
        res.status(500).end();
      } else {
        res.status(200).end();
      }
    });
  });
};


// Got to next question
// # Handler
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

    //console.log('INFO - Beginning question #' + game.currentQuestionNumber);
    //game.io.emit('question.start', game.currentQuestion);
    game.sendStatus();
    res.status(200).end();
  });
};


// Select a specific question and update the game's state
// callback signature is (err), err will be { questionNotFound: true } if the question can't be found
game.switchToQuestion = function (questionNumber, callback) {
  console.log('INFO - Trying to select question #' + questionNumber);
  game.questions.findOne({ number: questionNumber }, function (err, question) {
    if (err) { return callback(err); }
    if (!question) {
      console.log('INFO - No question #' + questionNumber);
      return callback({ questionNotFound: true });
    }

    game.currentQuestion = question;
    game.currentStatus = 'QUESTION_ASKED';
    console.log('INFO - Switched game state to question #' + questionNumber);

    return callback(null);
  });
};


// End game
// Switches game status to ended and notifies all players
// # Handler
game.endGame = function (req, res) {
  console.log('INFO - Ending game');

  game.currentQuestion = null;
  game.currentStatus = 'ENDED';
  game.sendStatus();

  res.status(200).end();
};


// Get a player's data, create him if he doesn't exist
// If player doesn't exist a new id will be given
// # Handler
game.getPlayer = function (req, res) {
  var id

  async.waterfall([
    function (cb) {
      if (!req.params.id) {
        return cb(null, null);
      } else {
        game.players.findOne({ _id: req.params.id}, cb);
      }
    }
    , function (player, cb) {
      if (player) {
        return cb(null, player)
      } else {
        game.players.insert({}, cb);
      }
    }
  ], function (err, player) {
      if (err) {
        return res.status(500).end();
      } else {
        return res.status(200).json(player);
      }
  });
};


// Record an answer to the given question by the given player
// Of course not very secure but who cares here ...
// Right now the way it's used there is the risk of answers not arriving in the right order
// Will implement timestamp based verification if I have the time
// # Handler
game.submitAnswer = function (req, res) {
  console.log('INFO - Received response ' + req.body.answer + ' for question ' + req.params.number + ' from player ' + req.body.playerId);

  var toSet = {};
  toSet['answers.' + req.params.number] = req.body.answer;
  game.players.update({ _id: req.body.playerId }, { $set: toSet }, {}, function (err) {
    return res.status(200).end();
  });
};


// Hold the game. No answer can be submitted from now on
// # Handler
game.hold = function (req, res) {
  game.currentStatus = 'HOLD';
  game.sendStatus();
  return res.status(200).end();
};

// Keep track of player count when a player leaves
game.playerLeft = function () {
  game.currentPlayers -= 1;
  console.log('INFO - A player left - ' + game.currentPlayers + ' players now');
};


// Send current status to a newly joining player (represented by his socket)
// Sending it to all players if no socket is passed to the function
game.sendStatus = function (socket) {
  if (socket) {
    console.log('INFO - Sending status to socket ' + socket.id);
    socket.emit('game.status', { currentStatus: game.currentStatus, currentQuestion: game.currentQuestion });
  } else {
    console.log('INFO - Sending status to all players');
    game.io.emit('game.status', { currentStatus: game.currentStatus, currentQuestion: game.currentQuestion });
  }
};


// Game initialization
game.init = function () {
  console.log('INFO - Initializing game');

  game.currentPlayers = 0;
  game.currentQuestion = null;
  game.currentStatus = 'NOT_STARTED';

  // Keep track of players count and actions on client disconnection
  game.io.on('connection', function (socket) {
    game.currentPlayers += 1;
    console.log('INFO - A player connected - ' + game.currentPlayers + ' players now');
    game.sendStatus(socket);
    socket.on('disconnect', game.playerLeft);
  });
};



// Interface
module.exports = function (io) {
  game.io = io;
  game.init();
  return game;
};
