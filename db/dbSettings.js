var mysql = require('mysql');

var pool = mysql.createPool({
  connectionLimit : 400,
  host: 'slyce-30.cdomdrxsal4d.us-west-2.rds.amazonaws.com',
  user: 'je_slyce',
  password: 'slycetest',
  database: 'slyce',
  port: 3306,
  queueLimit: 50,
  charset: 'utf8mb4_unicode_ci'
});

exports.pool = pool;
