console.log("MASTER");


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
