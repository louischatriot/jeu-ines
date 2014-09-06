console.log("Beginning play");

var socket = io();


socket.on('question', function (data) {
  console.log("================");
  console.log(data);
});


