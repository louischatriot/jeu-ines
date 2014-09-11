var socket = io()
  , actions = {}
  , currentStatus = 'NOT_STARTED'
  , currentQuestion = null;
  ;

function updateQuestionTitle () {
  if (currentStatus === 'ENDED') {
    $('#title').html('Fin des courses!');
    return;
  }

  if (currentQuestion) {
    $('#title').html('Q' + currentQuestion.number + ' - ' + currentQuestion.question);
  } else {
    $('#title').html('Le jeu va bientôt commencer!<br><br>Allez sur <b>jeuines.com</b>');
  }
}


function displayImage (url) {
  var $pic = $('<img src="' + url + '">')
  $pic.css('height', $('#image').height() + 'px')
  removeImage();
  $('#image').html($pic);
}

function removeImage () {
  $('#image').html('');
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

  if (currentQuestion.photoQuestionAsked && typeof currentQuestion.photoQuestionAsked === 'string' && currentQuestion.photoQuestionAsked.length > 0) {
    displayImage('/assets/img/' + currentQuestion.photoQuestionAsked);
  }
};


actions['HOLD'] = function (data) {
  if (!currentQuestion) {
    currentQuestion = data.currentQuestion;
    actions['QUESTION_ASKED'](data);
  }

  if (currentQuestion.photoQuestionAsked && typeof currentQuestion.photoQuestionAsked === 'string' && currentQuestion.photoQuestionAsked.length > 0) {
    displayImage('/assets/img/' + currentQuestion.photoQuestionAsked);
  }

  // Get the score for the current question if there is one
  $.ajax({ url: '/master/score/' + currentQuestion.number
         , complete: function (jqXHR) {
            var results = JSON.parse(jqXHR.response)
              , total
              ;

            total = results.A + results.B + results.C + results.D;
            if (total === 0) {
              results.A += 1;
              results.B += 1;
              results.C += 1;
              results.D += 1;
              total += 4;
            }

            results.A = Math.round(1000 * results.A / total) / 10;
            results.B = Math.round(1000 * results.B / total) / 10;
            results.C = Math.round(1000 * results.C / total) / 10;
            results.D = Math.round(1000 * results.D / total) / 10;

            ['A', 'B', 'C', 'D'].forEach(function (letter) {
              $('.answer-' + letter + ' .result').html(results[letter] + '%  ');
            });
         }
         });
};


actions['SHOW_RESULT'] = function (data) {
  changeToCorrect($('.valid'));

  if (currentQuestion.photoShowResult && typeof currentQuestion.photoShowResult === 'string' && currentQuestion.photoShowResult.length > 0) {
    displayImage('/assets/img/' + currentQuestion.photoShowResult);
  }
};


actions['NOT_STARTED'] = function (data) {
  currentQuestion = null;
  $('#answers').html('');
};


actions['RESET'] = function (data) {
  currentQuestion = null;
  $('#answers').html('');
};


actions['ENDED'] = function (data) {
  currentQuestion = null;
  $('#answers').html('');
  $.ajax({ url: '/master/highest-score'
         , complete: function (jqXHR) {
            var results = JSON.parse(jqXHR.response)
              , message = 'Meilleur score: <span style="font-size: 48px; color: gold; font-weight: bold;">' + results.highestScore + '</span>/' + data.questionsCount
              ;

            $('#results').html(message);
         }
  });
};








socket.on('game.status', function (data) {
  console.log("INFO - Received new status");
  console.log(data);
  currentStatus = data.currentStatus;
  removeImage();
  $('#results').html('');
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

$('#previous-state').on('click', function () {
  $.ajax({ url: '/master/previous-state'
         , type: 'POST'
         , data: {}
         , dataType: 'json'
         , contentType: 'application/json'
         });
});




// Initialization
updateQuestionTitle();




