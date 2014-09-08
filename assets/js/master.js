var socket = io()
  , actions = {}
  , currentStatus = 'NOT_STARTED'
  , currentQuestion = null;
  ;

function updateQuestionNumber () {
  if (currentQuestion) {
    $('#question-number').html('<h1>Question number ' + currentQuestion.number + '</h1>');
  } else {
    $('#question-number').html('<h1>No question yet</h1>');
  }
}


// Get information
actions['QUESTION_ASKED'] = function (data) {
  currentQuestion = data.currentQuestion;
  updateQuestionNumber();
};











socket.on('game.status', function (data) {
  console.log("INFO - Received new status");
  console.log(data);
  currentStatus = data.currentStatus;
  if (actions[data.currentStatus]) { actions[data.currentStatus](data); }
});







// Control game
$('#reset-game').on('click', function () {
  $.ajax({ url: '/master/reset-game'
         , type: 'POST'
         , data: {}
         , dataType: 'json'
         , contentType: 'application/json'
         });
});


$('#next-question').on('click', function () {
  $.ajax({ url: '/master/next-question'
         , type: 'POST'
         , data: {}
         , dataType: 'json'
         , contentType: 'application/json'
         });
});


$('#hold').on('click', function () {
  $.ajax({ url: '/master/hold'
         , type: 'POST'
         , data: {}
         , dataType: 'json'
         , contentType: 'application/json'
         });
});




// Initialization
updateQuestionNumber();
