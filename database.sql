CREATE DATABASE docdeti;

CREATE TABLE visits (
	id INT PRIMARY KEY AUTO_INCREMENT,
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

	feedbackType ENUM("positive", "negative", "nopurpose", "warning", "commercial"),
	feedbackSummary TEXT,
	protocol TEXT,

	isFeedbackSent BOOLEAN NOT NULL DEFAULT 0,
	isProtocolSent BOOLEAN NOT NULL DEFAULT 0,
	isRateSent BOOLEAN NOT NULL DEFAULT 0,

	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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
	
	visitId INT NOT NULL,

	FOREIGN KEY (visitId) REFERENCES visits(id) ON DELETE CASCADE
);

CREATE TABLE visit_dialog_messages (
	id INT PRIMARY KEY AUTO_INCREMENT,

	text TEXT NOT NULL,
	sender ENUM("bot", "user") NOT NULL,

	visitId INT NOT NULL,

	FOREIGN KEY (visitId) REFERENCES visits(id) ON DELETE CASCADE
);


CREATE TABLE webhooks (
	url VARCHAR(256) PRIMARY KEY NOT NULL
);

CREATE TABLE visit_webhook_status (
  id INT PRIMARY KEY AUTO_INCREMENT,
  visitId INT NOT NULL,
  webhookUrl VARCHAR(256) NOT NULL,
  isSent BOOLEAN NOT NULL DEFAULT 0,

  lastAttempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (visitId) REFERENCES visits(id),
  FOREIGN KEY (webhookUrl) REFERENCES webhooks(url)
);