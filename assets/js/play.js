console.log("Beginning play - Initializing data");

var currentQuestion = null
  , currentStatus = 'NOT_STARTED'
  , socket = io()
  , actions = {}
  , somethingShown = false   // Make sure a screen is always shown regardless of server state
  ;

// For recording my and the correct answers I should really be using
// A client side DB such as NeDB but this will be faster to implement

// Get my answers from local storage and returns it as an object
// If format is unexpected, return an empty object
function getMyAnswers () {
  var myAnswers;
  try {
    myAnswers = JSON.parse(localStorage.getItem('myAnswers'));
  } catch (e) {
    myAnswers = {};
  }
  if (!myAnswers || typeof myAnswers !== 'object') { myAnswers = {}; }
  return myAnswers;
}

// Get good answers in the same format
function getGoodAnswers () {
  var goodAnswers;
  try {
    goodAnswers = JSON.parse(localStorage.getItem('goodAnswers'));
  } catch (e) {
    goodAnswers = {};
  }
  if (!goodAnswers || typeof goodAnswers !== 'object') { goodAnswers = {}; }
  return goodAnswers;
}

// Given a myAnswers object, save it to local storage
function setMyAnswers (myAnswers) {
  localStorage.setItem('myAnswers', JSON.stringify(myAnswers));
}

// Given a goodAnswers object, save it to local storage
function setGoodAnswers (goodAnswers) {
  localStorage.setItem('goodAnswers', JSON.stringify(goodAnswers));
}


// Format for my answers: key, values where key is number and value is answer
function recordMyAnswer (number, letter) {
  var myAnswers = getMyAnswers();
  myAnswers[number.toString()] = letter;
  setMyAnswers(myAnswers);
}

// Record one answer
// answer is a boolean indicating correctness
function recordAnswer (number, letter, answer) {
  var goodAnswers = getGoodAnswers();
  goodAnswers['' + number + letter] = answer ? true : false;
  setGoodAnswers(goodAnswers);
}

function isMyAnswerCorrect (number) {
  var myAnswers = getMyAnswers()
    , goodAnswers = getGoodAnswers()
    ;

  if (!myAnswers[number]) { return false; }   // No answer means wrong
  return goodAnswers['' + number + myAnswers[number]] ? true : false;
}




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


// Changing state of one or several cartridge, between unselected, selected, good and bad
function changeCartridgeDisplay ($cartridge, prefix, letterColor, textColor) {
  $cartridge.find('.letter').css('color', letterColor);
  $cartridge.find('.text').css('color', textColor);
  $cartridge.find('.cartridge-left').css('background-image', "url('/assets/img/" + prefix + "left.png')");
  $cartridge.find('.cartridge-center').css('background-image', "url('/assets/img/" + prefix + "center.png')");
  $cartridge.find('.cartridge-right').css('background-image', "url('/assets/img/" + prefix + "right.png')");
}

function changeToSelected ($cartridge) {
  $cartridge.addClass('selected');
  changeCartridgeDisplay($cartridge, 'selected-', '#fff', '#000');
}

function changeToUnselected ($cartridge) {
  $cartridge.removeClass('selected');
  changeCartridgeDisplay($cartridge, '', 'gold', '#fff');
}

function changeToCorrect ($cartridge) {
  changeCartridgeDisplay($cartridge, 'correct-', '#fff', '#000');
}

function changeToWrong ($cartridge) {
  changeCartridgeDisplay($cartridge, 'wrong-', 'gold', '#fff');
}


actions['NOT_STARTED'] = function () {
  currentQuestion = null;
  $('#display-pannel').html($('#not-started').html());
  ensurePlayerIsLogged();
};


actions['QUESTION_ASKED'] = function (data, cb) {
  var callback = cb || function () {};

  ensurePlayerIsLogged(function () {
    currentQuestion = data.currentQuestion;
    var templateData = { question: currentQuestion };
    $('#display-pannel').html(Mustache.render($('#question-asked').html(), templateData));
    somethingShown = true;

    // Record right answers
    currentQuestion.answers.forEach(function (answer) {
      recordAnswer(currentQuestion.number, answer.letter, answer.valid);
    });

    if (getMyAnswers()[currentQuestion.number]) {
      changeToSelected($('.answer-' + getMyAnswers()[currentQuestion.number]));
    }

    // When clicking on an answer, select it and send choice to server
    $('#display-pannel .answer').on('click', function (event) {
      var $target = $(event.target).closest('.answer');
      changeToUnselected($('#display-pannel .answer'));
      changeToSelected($target);

      // Cache my answer for this question
      recordMyAnswer(currentQuestion.number, $target.data('letter'));

      // Send selected answer back to the server
      // Client and server are now in sync
      $.ajax({ url: '/answer/' + currentQuestion.number
             , type: 'POST'
             , dataType: 'json'
             , contentType: 'application/json'
             , data: JSON.stringify({ playerId: localStorage.getItem('playerId')
                                    , answer: $target.data('letter')
                                    })
             });

    });

    callback();
  });
};


actions['HOLD'] = function (data) {
  function hold () {
    $('#display-pannel .answer').off('click');
    // TODO: Hold specific display here
  }

  if (!somethingShown) {
    actions['QUESTION_ASKED'](data, hold);
  } else {
    hold();
  }
};


actions['SHOW_RESULT'] = function (data) {
  function showResult () {
    changeToWrong($('.selected'));
    changeToCorrect($('.valid'));
  }

  if (!somethingShown) {
    actions['QUESTION_ASKED'](data, showResult);
  } else {
    showResult();
  }
};


actions['RESET'] = function () {
  setMyAnswers({});
  setGoodAnswers({});
  actions['NOT_STARTED']();
};


actions['ENDED'] = function (data) {
  var templateData = {}
    , i, score = 0
    ;

  for (i = 1; i <= data.questionsCount; i += 1) {
    if (isMyAnswerCorrect(i)) { score += 1; }
  }

  templateData.score = score;
  templateData.maxScore = data.questionsCount;
  $('#display-pannel').html(Mustache.render($('#game-ended').html(), templateData));
};


socket.on('game.status', function (data) {
  console.log("INFO - Received new status");
  console.log(data);
  currentStatus = data.currentStatus;
  if (actions[data.currentStatus]) { actions[data.currentStatus](data); }
});

