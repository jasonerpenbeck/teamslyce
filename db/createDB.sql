-- ---
-- Table 'users'
-- List of users
-- ---

DROP TABLE IF EXISTS slyce.users;
		
CREATE TABLE slyce.users (
  id INTEGER NOT NULL AUTO_INCREMENT,
  name VARCHAR(256) NULL DEFAULT NULL COMMENT 'Name of User',
  isHost TINYINT NOT NULL DEFAULT 0 COMMENT '0 for No, 1 for Yes',
  dateCreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY (name)
) COMMENT 'List of users';

-- ---
-- Table 'qa'
-- List of qa sessions
-- ---
DROP TABLE IF EXISTS slyce.qa;
		
CREATE TABLE slyce.qa (
  id INTEGER NOT NULL AUTO_INCREMENT,
  hostId INTEGER NOT NULL COMMENT 'id of qa host',
  name VARCHAR(1024) NULL DEFAULT NULL COMMENT 'Name of QA Session',
  startDate TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  endDate TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  dateCreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (hostId) REFERENCES slyce.users (id)
) COMMENT 'List of qa sessions';

-- ---
-- Table 'questions'
-- List of questions
-- ---
DROP TABLE IF EXISTS slyce.questions;
		
CREATE TABLE slyce.questions (
  id INTEGER NOT NULL AUTO_INCREMENT,
  qaId INTEGER NOT NULL COMMENT 'qa id associated with question',
  userId INTEGER NOT NULL COMMENT 'user id associated with question',
  text VARCHAR(1024) NULL DEFAULT NULL COMMENT 'Name of QA Session',
  dateCreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (qaId) REFERENCES slyce.qa (id),
  FOREIGN KEY (userId) REFERENCES slyce.users (id)
) COMMENT 'List of qa sessions';

-- ---
-- Table 'answers'
-- List of answers to questions
-- ---
DROP TABLE IF EXISTS slyce.answers;
		
CREATE TABLE slyce.answers (
  id INTEGER NOT NULL AUTO_INCREMENT,
  questionId INTEGER NOT NULL COMMENT 'questionId associated with answer',
  answeringUserId INTEGER NULL COMMENT 'user id associated with the answering user',
  text VARCHAR(1024) NULL DEFAULT NULL COMMENT 'Name of QA Session',
  imageURL VARCHAR(1024) NULL DEFAULT NULL COMMENT 'URL of Image Associated with Answer', 
  dateCreated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (questionId) REFERENCES slyce.questions (id),
  FOREIGN KEY (answeringUserId) REFERENCES slyce.users (id)
) COMMENT 'List of answers to questions';
