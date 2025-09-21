CREATE DATABASE docdeti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE visits (
	id VARCHAR(256) PRIMARY KEY NOT NULL,
	parentName VARCHAR(256) NOT NULL,
	parentSurname VARCHAR(256) NOT NULL,
	parentPatronymic VARCHAR(256) NOT NULL,
	parentSex ENUM("male", "female") NOT NULL,
	parentAge INT NOT NULL,

	childName VARCHAR(256),
	childSurname VARCHAR(256),
	childPatronymic VARCHAR(256),
	childSex ENUM("male", "female"),
	childAge INT,

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

ALTER TABLE visits ADD COLUMN isCancelled BOOLEAN DEFAULT 0;

CREATE TABLE visit_feedbacks (
	id INT PRIMARY KEY AUTO_INCREMENT,
	type  ENUM("positive", "negative", "nopurpose", "warning", "commercial") NOT NULL,
	summary TEXT NOT NULL,
	isSent BOOLEAN NOT NULL DEFAULT 0,
	visitId VARCHAR(256) NOT NULL,
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	FOREIGN KEY (visitId) REFERENCES visits(id) ON DELETE CASCADE
);

ALTER TABLE visit_feedbacks MODIFY COLUMN type ENUM("positive", "negative", "nopurpose", "warning", "commercial", "callback") NOT NULL;

CREATE TABLE visit_rates (
 	id INT PRIMARY KEY AUTO_INCREMENT,

	 -- Закрытые (да/нет) вопросы
    didDoctorIntroduceThemselves INT NOT NULL,
    didDoctorGreetPatient INT NOT NULL,
    didDoctorIdentifyPatient INT NOT NULL,
    didDoctorUseOpenQuestion INT NOT NULL,
    didDoctorSummarizePatientInfo INT NOT NULL,
    didDoctorClarifyAgenda INT NOT NULL,
    didDoctorInterruptPatient INT NOT NULL,
    didDoctorAskClarifyingQuestions INT NOT NULL,
    didDoctorCheckPatientUnderstanding INT NOT NULL,
    didDoctorExplainNextSteps INT NOT NULL,
    didDoctorExplainWhereToFindReport INT NOT NULL,
    wasDoctorEmpathetic INT NOT NULL,

    -- Открытые (текстовые) вопросы
    referralToThisClinicSummary TEXT,
    referralToAnotherClinicSummary TEXT
	
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	visitId VARCHAR(256) NOT NULL,

	FOREIGN KEY (visitId) REFERENCES visits(id) ON DELETE CASCADE
);

DROP TABLE visit_dialog_messages;

CREATE TABLE visit_dialog_messages (
	id INT PRIMARY KEY AUTO_INCREMENT,

	text TEXT NOT NULL,
	sender ENUM("bot", "user") NOT NULL,

	visitFeedbackId INT NOT NULL,
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

	FOREIGN KEY (visitFeedbackId) REFERENCES visit_feedbacks(id) ON DELETE CASCADE
);


CREATE TABLE webhooks (
	url VARCHAR(256) PRIMARY KEY NOT NULL,
	type ENUM("newVisit", "cancelledVisit") NOT NULL,
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
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

DROP TABLE visit_webhook_status;
DROP TABLE visit_dialog_messages;
DROP TABLE visit_rates;
DROP TABLE visit_feedbacks;
DROP TABLE visits;