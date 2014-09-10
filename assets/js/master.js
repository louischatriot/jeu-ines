var socket = io()
  , actions = {}
  , currentStatus = 'NOT_STARTED'
  , currentQuestion = null;
  ;

function updateQuestionTitle () {
  if (currentQuestion) {
    $('#title').html('Q' + currentQuestion.number + ' - ' + currentQuestion.question);
  } else {
    $('#title').html('Le jeu va bientôt commencer');
  }
}


// Changing state of one or several cartridge, between unselected, selected, good and bad
function changeCartridgeDisplay ($cartridge, prefix, letterColor, textColor) {
  $cartridge.find('.letter').css('color', letterColor);
  $cartridge.find('.text').css('color', textColor);
  $cartridge.find('.cartridge-left').css('background-image', "url('/assets/img/" + prefix + "left.png')");
  $cartridge.find('.cartridge-center').css('background-image', "url('/assets/img/" + prefix + "center.png')");
  $cartridge.find('.cartridge-right').css('background-image', "url('/assets/img/" + prefix + "right.png')");
}

function changeToCorrect ($cartridge) {
  changeCartridgeDisplay($cartridge, 'correct-', '#fff', '#000');
}

function changeToWrong ($cartridge) {
  changeCartridgeDisplay($cartridge, 'wrong-', 'gold', '#fff');
}


// Get information
actions['QUESTION_ASKED'] = function (data) {
  var answersFirstRow = []
    , answersSecondRow = []
    , templateData = {}
    ;

  currentQuestion = data.currentQuestion;

  answersFirstRow.push(currentQuestion.answers[0]);
  answersFirstRow.push(currentQuestion.answers[1]);
  templateData.answersFirstRow = answersFirstRow;
  answersSecondRow.push(currentQuestion.answers[2]);
  answersSecondRow.push(currentQuestion.answers[3]);
  templateData.answersSecondRow = answersSecondRow;

  $('#answers').html(Mustache.render($('#answers-section').html(), templateData));
};


actions['SHOW_RESULT'] = function (data) {
  changeToCorrect($('.valid'));
};


actions['NOT_STARTED'] = function (data) {
  currentQuestion = null;
  $('#answers').html('');
};


actions['RESET'] = function (data) {
  currentQuestion = null;
  $('#answers').html('');
};









socket.on('game.status', function (data) {
  console.log("INFO - Received new status");
  console.log(data);
  currentStatus = data.currentStatus;
  if (actions[data.currentStatus]) { actions[data.currentStatus](data); }
  updateQuestionTitle();
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
  // Hold the game for all players
  $.ajax({ url: '/master/hold'
         , type: 'POST'
         , data: {}
         , dataType: 'json'
         , contentType: 'application/json'
         });

  // Get the score for the current question if there is one
  $.ajax({ url: '/master/score/' + currentQuestion.number
         , complete: function (jqXHR) {
            var results = JSON.parse(jqXHR.response);
            console.log('------------------');
            console.log(results);
         }
         });
});


$('#show-result').on('click', function () {
  $.ajax({ url: '/master/show-result'
         , type: 'POST'
         , data: {}
         , dataType: 'json'
         , contentType: 'application/json'
         });
});

$('#next-state').on('click', function () {
  $.ajax({ url: '/master/next-state'
         , type: 'POST'
         , data: {}
         , dataType: 'json'
         , contentType: 'application/json'
         });
});




// Initialization
updateQuestionTitle();

var $pic = $('<img src="/assets/img/left.png">')
$pic.css('height', $('#image').height() + 'px')

$('#image').html($pic);




