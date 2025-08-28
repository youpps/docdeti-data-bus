import { IVisitFeedback } from "../../types/visitFeedback";

const getVisitFeedbacksQuery = (visit: Partial<IVisitFeedback>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);

  const query = keys.length ? `WHERE ` + keys.map((key) => `${key} = :${key} `).join(" AND ") : "";

  return `SELECT id, type, summary, isSent, visitId FROM visit_feedbacks ${query};`;
};

const createVisitFeedbackQuery = () => {
  return `INSERT INTO visit_feedbacks(
    visitId,
    type,
    summary
  ) 
  VALUES(
    :visitId,
    :type,
    :summary
  )`;
};

const updateVisitFeedbackQuery = (visit: { id: number } & Partial<IVisitFeedback>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);
  const query = keys.map((key) => `${key} = :${key} `).join(", ");

  return `UPDATE visit_feedbacks SET ${query} WHERE id = :id;`;
};

export { getVisitFeedbacksQuery, createVisitFeedbackQuery, updateVisitFeedbackQuery };
