// Send question data, warn user when ok and empty fields
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
         , complete: function (jqXHR) {
            if (jqXHR.status === 200) {
              $('#feedback').attr('class', 'message-ok');
              $('#feedback').css('display', 'block');
              $('#feedback').html("La question a bien été rajoutée");
              ['#question', '#answer-a', '#answer-b', '#answer-c', '#answer-d'].forEach(function (id) {
                $(id).val("");
              });
            } else {
              $('#feedback').attr('class', 'message-problem');
              $('#feedback').css('display', 'block');
              $('#feedback').html("Un problème est survenu");
            }

            setTimeout(function () {
              $('#feedback').css('display', 'none');
            }, 1500);
         }
         });
});
