var Nedb = require('nedb')
  , game = {}
  ;

game.questions = new Nedb({ autoload: true, filename: 'data/questions.nedb' });

game.addQuestion = function (req, res) {
  game.questions.find({}, { number: 1 }, function (err, numbers) {
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
