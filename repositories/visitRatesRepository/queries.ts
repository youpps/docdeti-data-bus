import { IVisitRate } from "../../types/visitRate";

const getVisitRatesQuery = (visit: Partial<IVisitRate>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);

  const query = keys.length ? `WHERE ` + keys.map((key) => `${key} = :${key} `).join(" AND ") : "";

  return `SELECT id, didDoctorIntroduceThemselves, didDoctorGreetPatient, didDoctorUseOpenQuestion, didDoctorCommentOnObservations, didDoctorExplainResultInterpreterAndSpecialty, didDoctorExplainWhereToFindReport, wasDoctorEmpathetic, patientNegativeExperienceSummary, referralToAnotherClinicSummary, visitId FROM visit_rates ${query};`;
};

const createVisitRateQuery = () => {
  return `INSERT INTO visit_rates(visitId) VALUES(:visitId)`;
};

const updateVisitRateQuery = (visit: { id: number } & Partial<IVisitRate>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);
  const query = keys.map((key) => `${key} = :${key} `).join(", ");

  return `UPDATE visit_rates SET ${query} WHERE id = :id;`;
};

export { getVisitRatesQuery, createVisitRateQuery, updateVisitRateQuery };
