var express = require('express')
  , app = express()
  , server = require('http').Server(app)
  , io = require('socket.io')(server)
  , game = require('./lib/game')(io)
  , bodyParser = require('body-parser')
  ;

app.use(bodyParser.json());


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

// Game master
app.get('/master', function (req, res) {
  res.sendFile(process.cwd() + '/pages/master.html');
});

// Next question
app.post('/master/next-question', game.beginNextQuestion);


// Serve static client-side js and css (should really be done through Nginx but at this scale we don't care)
app.get('/assets/*', function (req, res) {
  res.sendFile(process.cwd() + req.url);
});



server.listen(1504);
