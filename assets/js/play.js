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
// callback signature: (err)
function ensurePlayerIsLogged (cb) {
  var callback = function (jqXHR) {
    if (jqXHR.status === 200) {
      localStorage.setItem('playerId', JSON.parse(jqXHR.response)._id);
      console.log('INFO - Player logged as id ' + localStorage.getItem('playerId'));
      if (cb) { return cb(null); }
    } else {
      if (cb) { return cb({ getPlayerFail: true }); }
    }
  };
    
  console.log('INFO - Ensuring player is logged');

  if (localStorage.getItem('playerId')) {
    $.ajax({ url: '/player/' + localStorage.getItem('playerId')
           , complete: callback
           });
  } else {
    $.ajax({ url: '/player/'
           , complete: callback
           });
  }
}


actions['NOT_STARTED'] = function (data) {
  $('#display-pannel').html($('#not-started').html());
  ensurePlayerIsLogged();
};


actions['QUESTION_ASKED'] = function (data) {
  var templateData = { question: data.currentQuestion };
  $('#display-pannel').html(Mustache.render($('#question-asked').html(), templateData));
  $('#display-pannel .answer').on('click', function (event) {
    var $target = $(event.target);
    $('#display-pannel .answer').removeClass('selected');
    $target.addClass('selected');
  });
};


socket.on('game.status', function (data) {
  console.log("INFO - Received new status");
  console.log(data);
  actions[data.currentStatus](data);
});









