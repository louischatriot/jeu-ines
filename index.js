var express = require('express')
  , app = express()
  , server = require('http').Server(app)
  , io = require('socket.io')(server)
  , game = require('./lib/game')(io)
  , bodyParser = require('body-parser')
  ;

app.use(bodyParser.json());


// Game master
app.get('/master', function (req, res) {
  res.sendFile(process.cwd() + '/pages/master.html');
});

// Reset game
app.post('/master/reset-game', game.resetGame);

// Next question
app.post('/master/next-question', game.beginNextQuestion);

// Hold game
app.post('/master/hold', game.hold);

// Question creation page
app.get('/add-question', function (req, res) {
  res.sendFile(process.cwd() + '/pages/add-question.html');
});

// Actual question creation
app.post('/add-question', game.addQuestion);

// Play
app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/pages/play.html');
});

// Get player, create him if he doesn't exist yet
app.get('/player/:id?', game.getPlayer);

// Submit an answer
app.post('/answer/:number', game.submitAnswer);


// Serve static client-side js and css (should really be done through Nginx but at this scale we don't care)
app.get('/assets/*', function (req, res) {
  res.sendFile(process.cwd() + req.url);
});


// Last wall of defense
process.on('uncaughtException', function (err) {
  console.log('UNCAUGHT EXCEPTION !!!');
  console.log(err);
});


server.listen(1504);
