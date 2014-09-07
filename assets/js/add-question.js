// Send question data, warn user when ok and empty fields
$('#create-question').on('submit', function (event) {
  var question = { question: $('#question').val()
                 , answerA: $('#answer-a').val()
                 , answerB: $('#answer-b').val()
                 , answerC: $('#answer-c').val()
                 , answerD: $('#answer-d').val()
                 , answerAValid: $('#answer-a-valid').is(':checked')
                 , answerBValid: $('#answer-b-valid').is(':checked')
                 , answerCValid: $('#answer-c-valid').is(':checked')
                 , answerDValid: $('#answer-d-valid').is(':checked')
                 };

  event.preventDefault();

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
              ['#answer-a-valid', '#answer-b-valid', '#answer-c-valid', '#answer-d-valid'].forEach(function (id) {
                $(id).removeAttr('checked');
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




