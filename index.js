var express = require('express')
  , app = express()
  , game = require('lib/game')
  ;

app.get('/', function (req, res) {
  console.log('===============');
  res.send("Hello world");
});




app.listen(1504);
