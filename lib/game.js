var Nedb = require('nedb')
  , _ = require('underscore')
  , game = {}
  ;

game.questions = new Nedb({ autoload: true, filename: 'data/questions.nedb' });

game.addQuestion = function (req, res) {
  game.questions.find({}, { number: 1 }, function (err, numbers) {
    var max = numbers.length === 0 ? 0 : _.max(numbers)
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





// Interface
module.exports = game;
