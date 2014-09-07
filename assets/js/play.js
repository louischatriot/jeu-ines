console.log("Beginning play - Initializing data");
if (!localStorage.myAnswers) { localStorage.myAnswers = {}; }
if (!localStorage.goodAnswers) { localStorage.goodAnswers = {}; }

var currentQuestion = null
  , currentState = 'NOT_STARTED'
  , socket = io()
  , actions = {}
  ;

actions['NOT_STARTED'] = function (data) {
  $('#display-pannel').html($('#not-started').html());
};



actions['QUESTION_ASKED'] = function (data) {
  var templateData = { question: data.currentQuestion };
  $('#display-pannel').html(Mustache.render($('#question-asked').html(), templateData));
};


socket.on('game.status', function (data) {
  console.log("======================");
  console.log("Received new status");
  console.log(data);
  actions[data.currentStatus](data);
});

