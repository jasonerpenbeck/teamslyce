/**
 * @file add and retrieve qa details
 * @module api/qa
 */

var db = require('../db/dbSettings.js').pool;
var user = require('./user.js');
var util = require('./util.js');

/**
 * Receives POST requests from /qa to create new qa session
 *
 * @function
 * @param {object} req Request Object from POST Request
 * @param {object} res Response Object from POST Request
 */
var add = function(req, res) {
  
  // Error Checking
  if(!req.body.host_name) {
    util.finalizeResponse({}, 'Name of Host is Missing', res, {});
    return; 
  }
  
  var parsedStartTime = Date.parse(req.body.start_time);
  var parsedEndTime = Date.parse(req.body.end_time);
  
  if(isNaN(parsedStartTime)) {
    util.finalizeResponse({}, 'Start Time is Missing', res, {});
    return; 
  }
  
  if(isNaN(parsedEndTime)) {
    util.finalizeResponse({}, 'End Time is Missing', res, {});
    return; 
  }
  
  if(parsedEndTime <= parsedStartTime) {
    util.finalizeResponse({}, 'QA Must End After It Begins.  Cmon.', res, {});
    return;
  }
 
  // check if user exists
  // going to presume if user does not exist that new user is OK to host a QA
  var qaDetails = {
    name: req.body.host_name,
    qaName: req.body.qaName || 'Latest QA Session',
    startDate: req.body.start_time,
    endDate: req.body.end_time
  };
  user.get(qaDetails.name, true, addQA.bind(null, res, qaDetails));
};

/**
 * Adds New QA to Database
 *
 * @function
 * @param {object} res Response Object from POST Request
 * @param {object} qaDetails List of Attributes Describing QA to be Added
 * @param {object} err Object Describing Error (if any)
 * @param {object} user List of Attributes Describing User Creating QA 
 */
var addQA = function(res, qaDetails, err, user) {
  var sql = [
     'INSERT INTO qa (hostId, name, startDate, endDate)',
     'VALUES (',
        user.id + ',',
        db.escape(qaDetails.qaName) + ',',
        db.escape(qaDetails.startDate) + ',',
        db.escape(qaDetails.endDate),
     ')',
     ';'
  ].join(' ');

  db.query(sql, function(err, result) {
    if(err) {
      util.finalizeResponse(err, 'Unable to Create QA', res, null);
      return;
    }
    
    var responseDetails = {
      user: {
        id: user.id,
        name: user.name  
      },
      details: {
        id: result.insertId,
        qaName: qaDetails.qaName,
        start_date: Date.parse(qaDetails.startDate),
        end_date: Date.parse(qaDetails.endDate)        
      }
    };
    
    util.finalizeResponse(null, null, res, responseDetails);
  });  
};

/**
 * Receives GET Requests From /qa/:qa_id to Retrieve Details of QA Session
 *
 * @function
 * @param {object} req Request Object from POST Request
 * @param {object} res Response Object from POST Request  
 */
var get = function(req, res) {
  var sql = [
    'SELECT qa.id, qa.name, users.id AS hostId, users.name AS hostName,', 
    'UNIX_TIMESTAMP(qa.startDate) * 1000 AS startDate,', 
    'UNIX_TIMESTAMP(qa.endDate) * 1000 AS endDate',
    'FROM qa',
      'INNER JOIN users ON users.id = qa.hostId',
    'WHERE',
      'qa.id = ',
      db.escape(res.locals.qa_id),
    ';'
   ].join(' ');    

  var q = db.query(sql, function(err, rows) {
    if(err) {
      util.finalizeResponse(err, 'Unable to Retrieve QA', res, null);
      return;
    }
     
    if(rows.length === 0) {
      // handle when erroneous qa id is entered
      util.finalizeResponse(null, 'No Matching QA ID in Our Records', res, {});
      return;
    } 
     
    var responseDetails = {
      user: {
        id: rows[0].hostId,
        name: rows[0].hostName
      },
      details: {
        id: rows[0].id,
        name: rows[0].name,
        startDate: rows[0].startDate,
        endDate: rows[0].endDate        
      }
    };
    
    util.finalizeResponse(null, null, res, responseDetails); 
   });
};

module.exports = {
  add: add,
  get: get
};