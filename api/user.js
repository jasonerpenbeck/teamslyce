/**
 * @file add and retrieve user
 * @module api/user
 */

var db = require('../db/dbSettings.js').pool;

/**
 * Gets Details of a User (Used Mainly To Check For Existence Of User Name)
 *
 * @function
 * @param {string} name Name of User to be Retrieved (User Names Are Unique)
 * @param {boolean} isHost Setting to Indicate Whether User Should Be Added as Host of QA
 * @param {function} callback Function to Invoke When User is Retrieved (or Error Occurs)
 */
var get = function(name, isHost, callback) {  
  var sql = [
    'SELECT id, name, isHost',
    'FROM users',
    'WHERE',
      'name = ',
      db.escape(name),
    ';'
  ].join(' ');    

  db.query(sql, function(err, rows) {
    if(err) {
      callback(err);
      return;
    }
    
    if(rows.length === 0) {
     // User with this name does not exist; Create user now
      add(name, isHost, callback);
      return;
    }
    
    var responseDetails = {
      id: rows[0].id,
      name: rows[0].name,
      isHost: rows[0].isHost
    };
    
    callback(null, responseDetails);
  });
};

/**
 * Adds User to Database
 *
 * @function
 * @param {string} name Name of User to be Retrieved (User Names Are Unique)
 * @param {boolean} isHost Setting to Indicate Whether User Should Be Added as Host of QA
 * @param {function} callback Function to Invoke When User is Added (or Error Occurs)
 */
var add = function(name, isHost, callback) {
  var hostFlag = (!!isHost) ? 1 : 0;
  var sql = [
      'INSERT INTO users (name, isHost)',
      'VALUES (',
      db.escape(name) + ',',
      hostFlag,
      ')',
      ';'
  ].join(' ');

  db.query(sql, function(err, result) {
    if(err) {
      console.log(err);
      callback(err);
      return;
    }
      
    var userDetails = {
      id: result.insertId,
      name: name,
      isHost: hostFlag
    };
    
    callback(null, userDetails);
  });
};

module.exports = {
  get: get,
  add: add
};
