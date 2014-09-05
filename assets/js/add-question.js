$('#create').on('click', function () {
  var question = { question: $('#question').val()
                 , answerA: $('#answer-a').val()
                 , answerB: $('#answer-b').val()
                 , answerC: $('#answer-c').val()
                 , answerD: $('#answer-d').val()
                 };


  $.ajax({ url: '/add-question'
         , type: 'POST'
         , data: JSON.stringify(question)
         , dataType: 'json'
         , contentType: 'application/json'
         });
});
