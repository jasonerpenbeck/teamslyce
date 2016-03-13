var express = require('express');
var bodyParser = require('body-parser');
var compress = require('compression');

var qa = require('./api/qa.js');
var question = require('./api/question.js');
var answer = require('./api/answer.js');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(compress());

var port = 8080;

// Allow CORS
app.use('/', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Endpoints
app.post('/qa', qa.add);

app.param(['qa_id'], function (req, res, next, value) {
  res.locals.qa_id = value;
  next();
});

app.get('/qa/:qa_id/questions', question.getList);
app.get('/qa/:qa_id', qa.get);

app.post('/question/:qa_id', question.add);

app.param(['question_id'], function (req, res, next, value) {
  res.locals.question_id = value;
  next();
});

app.post('/answer/:question_id', answer.add);

console.log('Listening on port...' + port);
app.listen(port);

