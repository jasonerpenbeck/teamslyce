/**
 * @file add and retrieve question details
 * @module api/question
 */
var urlParser = require('url');
var _ = require('lodash');

var db = require('../db/dbSettings.js').pool;
var user = require('./user.js');
var util = require('./util.js');

/**
 * Receives POST requests from /question/:qa_id to create new question
 *
 * @function
 * @param {object} req Request Object from POST Request
 * @param {object} res Response Object from POST Request
 */
var add = function(req, res) {
  if(!req.body.asked_by_name) {
    util.finalizeResponse({}, 'Name of Asking User is Missing', res, {});
    return; 
  }
  
  if(!req.body.text) {
    util.finalizeResponse({}, 'Question is Missing', res, {});
    return; 
  }

  // check if user exists
  var questionDetails = {
    name: req.body.asked_by_name,
    qaId: res.locals.qa_id,
    text: req.body.text
  };
  user.get(questionDetails.name, true, addQuestion.bind(null, res, questionDetails));
};

/**
 * Adds New Question to Database
 *
 * @function
 * @param {object} res Response Object from POST Request
 * @param {object} answerDetails List of Attributes Describing Question to be Added
 * @param {object} err Object Describing Error (if any)
 * @param {object} user List of Attributes Describing User Creating Question 
 */
var addQuestion = function(res, questionDetails, err, user) {
  var sql = [
    'INSERT INTO questions (qaId, userId, text)',
    'VALUES (',
      db.escape(questionDetails.qaId) + ',',
      user.id + ',',
      db.escape(questionDetails.text),
    ')',
    ';'
   ].join(' ');

   db.query(sql, function(err, result) {
     if(err) {
       console.log(err);
       util.finalizeResponse(err, 'Unable to Create Question', res, null);
       return;
     }
     
     var responseDetails = {
       user: {
        id: user.id,
        name: user.name         
       },
       details: {
        id: result.insertId,
        qaId: questionDetails.qaId,
        text: questionDetails.text         
       }
     };
     
     util.finalizeResponse(null, null, res, responseDetails);
   });  
};

/**
 * Receives GET Requests From /qa/:qa_id/questions to Retrieve All Questions Related to QA Session
 *
 * @function
 * @param {object} req Request Object from GET Request
 * @param {object} res Response Object from GET Request  
 */
var getList = function(req, res) {
  
  if(!_.isFinite(parseInt(res.locals.qa_id))) {
    util.finalizeResponse({}, 'Invalid QA ID', res, null);
  }
  
  var path = urlParser.parse(req.url, true);
  var hasAnswer;
  var allResults = false;
  
  if(!path.query.hasAnswer) {
    allResults = true;
  } else {
    var hasAnswer = (path.query.hasAnswer === 'true') ? true : false;    
  }
  
  var sql = [
    'SELECT questions.id AS questionId, questions.userId AS askingUser, u.name AS asked_by, questions.text AS questionText, UNIX_TIMESTAMP(questions.dateCreated) * 1000 AS questionDate,',
    'answers.id AS answerId, answers.answeringUserId AS answeringUser, u2.name AS answered_by, answers.text AS answerText, answers.imageURL as answerImageURL, UNIX_TIMESTAMP(answers.dateCreated) * 1000 AS answerDate',  
    'FROM questions',
      'LEFT JOIN answers ON questions.id = answers.questionId',
      'INNER JOIN users u ON u.id = questions.userId',
      'LEFT JOIN users u2 ON u2.id = answers.answeringUserId',
    'WHERE',
      'questions.qaId = ',
      db.escape(res.locals.qa_id),
    'ORDER BY questions.dateCreated DESC',
    ';'
  ].join(' ');    

  db.query(sql, function(err, rows) {
    if(err) {
      console.log(err);
      util.finalizeResponse(err, 'Unable to Retrieve QA', res, null);
      return;
    }
      
    if(rows.length === 0) {
      // handle when erroneous qa id has no questions/answers
      util.finalizeResponse(null, 'No Questions or Answers For This QA', res, {});
      return;
    }

    var processedRows = _.chain(rows)
                          .filter(function(item) {
                            if(allResults) {
                              return true;
                            } else {
                              if(hasAnswer) {
                                return item.answerId !== null;
                              } else {
                                return item.answerId === null;  
                              }  
                            } 
                          })
                          .map(organizeGetQuestionsResponse)
                          .value()
    
    util.finalizeResponse(null, null, res, processedRows);
  });      
};

/**
 * Formats Data for Get Questions Response
 *
 * @function
 * @param {object} item Object Containing Question Data
 * @returns  {object} Formatted Object of Question Data 
 */
var organizeGetQuestionsResponse = function(item) {  
  return {
    question: {
      user: {
        id: item.askingUser,
        name: item.asked_by  
      },
      details: {
        id: item.questionId,
        text: item.questionText,
        dateCreated: item.questionDate        
      }
    },
    answer: {
      user: {
        id: item.answeringUser || null,
        name: item.answered_by || null  
      },
      details: {
        id: item.answerId || null,
        text: item.answerText || null,
        imageURL: item.answerImageURL || null,
        dateCreated: item.answerDate || null        
      }
    },
    hasAnswer: (!!item.answerId)
  };
}

module.exports = {
  add: add,
  getList: getList
};