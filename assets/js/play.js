console.log("Beginning play - Initializing data");
if (!localStorage.getItem('myAnswers')) { localStorage.setItem('myAnswers', {}); }
if (!localStorage.getItem('goodAnswers')) { localStorage.setItem('goodAnswers', {}); }

var currentQuestion = null
  , currentState = 'NOT_STARTED'
  , socket = io()
  , actions = {}
  ;


// Asynchronous function which ensures this player is logged and recorded in the database
// If he's not, API gets called, creates a new player and sends back the id
// Of course nothing is secured in this kind of environment
// callback signature: (err, playerId)
function ensurePlayerIsLogged (cb) {
  var callback = cb || function () {};

  console.log('INFO - Ensuring player is logged');

  if (localStorage.getItem('playerId')) {
    $.ajax({ url: '/player/' + localStorage.getItem('playerId') });
  } else {
    $.ajax({ url: '/player/' });
  }
  

}


actions['NOT_STARTED'] = function (data) {
  $('#display-pannel').html($('#not-started').html());
  ensurePlayerIsLogged();
};


actions['QUESTION_ASKED'] = function (data) {
  var templateData = { question: data.currentQuestion };
  $('#display-pannel').html(Mustache.render($('#question-asked').html(), templateData));
};


socket.on('game.status', function (data) {
  console.log("INFO - Received new status");
  console.log(data);
  actions[data.currentStatus](data);
});

