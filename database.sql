CREATE DATABASE docdeti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE visits (
	id VARCHAR(256) PRIMARY KEY NOT NULL,
	parent VARCHAR(256) NOT NULL,
	child VARCHAR(256) NOT NULL,
	type ENUM("nurse", "doctor") NOT NULL, 
	recordUrl VARCHAR(256) NOT NULL,
	processedAt TIMESTAMP NOT NULL,
	date TIMESTAMP NOT NULL,
	phone VARCHAR(256) NOT NULL,
	comment VARCHAR(512) NOT NULL,
	doctor VARCHAR(256) NOT NULL,
	address VARCHAR(256) NOT NULL,
	isLast BOOLEAN NOT NULL,

	specialization VARCHAR(256) NOT NULL,
	serviceName VARCHAR(256) NOT NULL,

	protocol TEXT,

	isProtocolSent BOOLEAN NOT NULL DEFAULT 0,
	isRateSent BOOLEAN NOT NULL DEFAULT 0,

	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE visits ADD COLUMN isCancelled BOOLEAN NOT NULL DEFAULT 0;

CREATE TABLE visit_feedbacks (
	id INT PRIMARY KEY AUTO_INCREMENT,
	type  ENUM("positive", "negative", "nopurpose", "warning", "commercial") NOT NULL,
	summary TEXT NOT NULL,
	isSent BOOLEAN NOT NULL DEFAULT 0,
	visitId VARCHAR(256) NOT NULL,

	FOREIGN KEY (visitId) REFERENCES visits(id) ON DELETE CASCADE
);

CREATE TABLE visit_rates (
 	id INT PRIMARY KEY AUTO_INCREMENT,

	didDoctorIntroduceThemselves INT,
	didDoctorGreetPatient INT,
	didDoctorUseOpenQuestion INT,

	didDoctorCommentOnObservations INT,
	didDoctorExplainResultInterpreterAndSpecialty INT,
	didDoctorExplainWhereToFindReport INT,

	wasDoctorEmpathetic INT,
	patientNegativeExperienceSummary TEXT,
	referralToAnotherClinicSummary TEXT,
	
	visitId VARCHAR(256) NOT NULL,

	FOREIGN KEY (visitId) REFERENCES visits(id) ON DELETE CASCADE
);

DROP TABLE visit_dialog_messages;

CREATE TABLE visit_dialog_messages (
	id INT PRIMARY KEY AUTO_INCREMENT,

	text TEXT NOT NULL,
	sender ENUM("bot", "user") NOT NULL,

	visitFeedbackId INT NOT NULL,

	FOREIGN KEY (visitFeedbackId) REFERENCES visit_feedbacks(id) ON DELETE CASCADE
);


CREATE TABLE webhooks (
	url VARCHAR(256) PRIMARY KEY NOT NULL
);


CREATE TABLE visit_webhook_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visitId VARCHAR(256) NOT NULL,
  webhookUrl VARCHAR(256) NOT NULL,
  isSent BOOLEAN NOT NULL DEFAULT 0,

  lastAttempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (visitId) REFERENCES visits(id),
  FOREIGN KEY (webhookUrl) REFERENCES webhooks(url)
);