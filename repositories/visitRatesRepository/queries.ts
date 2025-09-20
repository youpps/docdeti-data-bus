import { IVisitRate } from "../../types/visitRate";

const getVisitRatesQuery = (visit: Partial<IVisitRate>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);

  const query = keys.length ? `WHERE ` + keys.map((key) => `${key} = :${key} `).join(" AND ") : "";

  return `SELECT id, visitId,
   didDoctorIntroduceThemselves,
   didDoctorGreetPatient,
   didDoctorIdentifyPatient,
   didDoctorUseOpenQuestion,
   didDoctorSummarizePatientInfo,
   didDoctorClarifyAgenda,
   didDoctorInterruptPatient,
   didDoctorAskClarifyingQuestions,
   didDoctorCheckPatientUnderstanding,
   didDoctorExplainNextSteps,
   didDoctorExplainWhereToFindReport,
   wasDoctorEmpathetic,
   referralToThisClinicSummary,
   referralToAnotherClinicSummary FROM visit_rates ${query};`;
};

const createVisitRateQuery = () => {
  return `INSERT INTO visit_rates(
    visitId,
   didDoctorIntroduceThemselves,
   didDoctorGreetPatient,
   didDoctorIdentifyPatient,
   didDoctorUseOpenQuestion,
   didDoctorSummarizePatientInfo,
   didDoctorClarifyAgenda,
   didDoctorInterruptPatient,
   didDoctorAskClarifyingQuestions,
   didDoctorCheckPatientUnderstanding,
   didDoctorExplainNextSteps,
   didDoctorExplainWhereToFindReport,
   wasDoctorEmpathetic,
   referralToThisClinicSummary,
   referralToAnotherClinicSummary
  ) 
  VALUES(
      :visitId,
   :didDoctorIntroduceThemselves,
   :didDoctorGreetPatient,
   :didDoctorIdentifyPatient,
   :didDoctorUseOpenQuestion,
   :didDoctorSummarizePatientInfo,
   :didDoctorClarifyAgenda,
   :didDoctorInterruptPatient,
   :didDoctorAskClarifyingQuestions,
   :didDoctorCheckPatientUnderstanding,
   :didDoctorExplainNextSteps,
   :didDoctorExplainWhereToFindReport,
   :wasDoctorEmpathetic,
   :referralToThisClinicSummary,
   :referralToAnotherClinicSummary
  )`;
};

const updateVisitRateQuery = (visit: { id: number } & Partial<IVisitRate>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);
  const query = keys.map((key) => `${key} = :${key} `).join(", ");

  return `UPDATE visit_rates SET ${query} WHERE id = :id;`;
};

export { getVisitRatesQuery, createVisitRateQuery, updateVisitRateQuery };
