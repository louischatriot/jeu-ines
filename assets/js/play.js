console.log("Beginning play - Initializing data");
if (!localStorage.myAnswers) { localStorage.myAnswers = {}; }
if (!localStorage.goodAnswers) { localStorage.goodAnswers = {}; }

var currentQuestion = null
  , currentState = 'NOT_STARTED'
  ;


var socket = io();

// Starting a new question
socket.on('question.start', function (data) {
  console.log("================");
  console.log(data);
});


socket.on('game.status', function (data) {
  console.log("======================");
  console.log("Received new status");
  console.log(data);
});


function startCurrentQuestion () {
  console.log("=====================");
  console.log("Starting current question");
  console.log(currentQuestion);
}


