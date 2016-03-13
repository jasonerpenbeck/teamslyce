/**
 * @file add and retrieve answer details
 * @module api/answer
 */

var db = require('../db/dbSettings.js').pool;
var user = require('./user.js');
var util = require('./util.js');

/**
 * Receives POST requests from /answer/:question_id to create new answer
 *
 * @function
 * @param {object} req Request Object from POST Request
 * @param {object} res Response Object from POST Request
 */
var add = function(req, res) {
  
  if(!req.body.answered_by) {
    util.finalizeResponse({}, 'Name of Answering User is Missing', res, {});
    return; 
  }
  
  if(!req.body.text && !req.body.image_url) {
    util.finalizeResponse({}, 'Answer is Missing Text and URL of Image.  Please Include at Least One.', res, {});
    return; 
  }
  
  var answerDetails = {
    name: req.body.answered_by,
    questionId: res.locals.question_id,
    text: req.body.text || null,
    imageURL: req.body.image_url || null
  };
  user.get(answerDetails.name, false, addAnswer.bind(null, res, answerDetails));
};

/**
 * Adds New Answer to Database
 *
 * @function
 * @param {object} res Response Object from POST Request
 * @param {object} answerDetails List of Attributes Describing Answer to be Added
 * @param {object} err Object Describing Error (if any)
 * @param {object} user List of Attributes Describing User Creating Answer 
 */
var addAnswer = function(res, answerDetails, err, user) {
  var sql = [
    'INSERT INTO answers (questionId, answeringUserId, text, imageURL)',
    'VALUES (',
      db.escape(answerDetails.questionId) + ',',
      user.id + ',',
      db.escape(answerDetails.text) + ',',
      db.escape(answerDetails.imageURL),
    ')',
    ';'
  ].join(' ');

  db.query(sql, function(err, result) {
    if(err) {
      console.log(err);
      util.finalizeResponse(err, 'Unable to Create Answer', res, null);
      return;
    }
    
    var responseDetails = {
      user: {
        id: user.id,
        name: user.name
      },
      details: {
        answerId: result.insertId,
        questionId: answerDetails.questionId,
        text: answerDetails.text,
        imageURL: answerDetails.imageURL
      }
    };
    
    util.finalizeResponse(null, null, res, responseDetails);
  });    
};

module.exports = {
  add: add
};