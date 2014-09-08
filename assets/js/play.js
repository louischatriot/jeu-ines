console.log("Beginning play - Initializing data");

var currentQuestion = null
  , currentStatus = 'NOT_STARTED'
  , socket = io()
  , actions = {}
  ;

// For recording my and the correct answers I should really be using
// A client side DB such as NeDB but this will be faster to implement

// Format for my answers: key, values where key is number and value is answer
function recordMyAnswer (number, letter) {
  var myAnswers;
  try {
    myAnswers = JSON.parse(localStorage.getItem('myAnswers'));
  } catch (e) {
    myAnswers = {};
  }
  if (!myAnswers || typeof myAnswers !== 'object') { myAnswers = {}; }
  myAnswers[number.toString()] = letter;
  localStorage.setItem('myAnswers', JSON.stringify(myAnswers));
}

// Format for correct answers: key, value where key is id formed from number and letter
// and value true or false depending on correctness, allowing for multiple right answers
function recordGoodAnswers (number, answers) {
  var goodAnswers;
  try {
    goodAnswers = JSON.parse(localStorage.getItem('goodAnswers'));
  } catch (e) {
    goodAnswers = {};
  }
  if (!goodAnswers || typeof goodAnswers !== 'object') { goodAnswers = {}; }
  ['A', 'B', 'C', 'D'].forEach(function (letter) {
    goodAnswers['' + number + letter] = answers[letter] ? true : false;
  });
  localStorage.setItem('goodAnswers', JSON.stringify(goodAnswers));
}

function isAnswerGood (number) {
  var myAnswers, goodAnswers;

  try {
    myAnswers = JSON.parse(localStorage.getItem('myAnswers'))
    goodAnswers = JSON.parse(localStorage.getItem('goodAnswers'))
  } catch (e) {
    return false;   // Consider that if we don't have the right answers for this question ours is false
  }
  // If answers could not be parsed as objects, that means that don't have the expected format
  // Meaning this was called before answers were set, so we must be wrong (and actually that shouldn't even happen)
  if (!myAnswers || typeof myAnswers !== 'object') { return false; }
  if (!goodAnswers || typeof goodAnswers !== 'object') { return false; }

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


actions['NOT_STARTED'] = function (data) {
  currentQuestion = null;
  $('#display-pannel').html($('#not-started').html());
  ensurePlayerIsLogged();
};


actions['QUESTION_ASKED'] = function (data) {
  ensurePlayerIsLogged(function () {
    currentQuestion = data.currentQuestion;
    var templateData = { question: currentQuestion };
    $('#display-pannel').html(Mustache.render($('#question-asked').html(), templateData));

    $('#display-pannel .answer').on('click', function (event) {
      var $target = $(event.target).parent();
      $('#display-pannel .answer').removeClass('selected');
      $target.addClass('selected');

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
  });
};


actions['HOLD'] = function (data) {
  $('#display-pannel .answer').off('click');
};


socket.on('game.status', function (data) {
  console.log("INFO - Received new status");
  console.log(data);
  currentStatus = data.currentStatus;
  actions[data.currentStatus](data);
});

