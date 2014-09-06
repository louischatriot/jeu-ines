var express = require('express')
  , app = express()
  , server = require('http').Server(app)
  , io = require('socket.io')(server)
  , game = require('./lib/game')(io)
  , bodyParser = require('body-parser')
  ;

app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send("Hello world");
});


// Question creation page
app.get('/add-question', function (req, res) {
  res.sendFile(process.cwd() + '/pages/add-question.html');
});

// Actual question creation
app.post('/add-question', game.addQuestion);


// Play
app.get('/play', function (req, res) {
  res.sendFile(process.cwd() + '/pages/play.html');
});


// Serve static client-side js and css (should really be done through Nginx but at this scale we don't care)
app.get('/assets/*', function (req, res) {
  res.sendFile(process.cwd() + req.url);
});



server.listen(1504);
