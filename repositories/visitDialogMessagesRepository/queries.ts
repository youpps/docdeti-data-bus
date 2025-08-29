import { IVisit } from "../../types/visit";
import { IVisitDialogMessage } from "../../types/visitDialogMessage";

const getVisitDialogMessagesQuery = (visit: Partial<IVisitDialogMessage>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);

  const query = keys.length ? `WHERE ` + keys.map((key) => `${key} = :${key} `).join(" AND ") : "";

  return `SELECT id, text, sender, visitFeedbackId FROM visit_dialog_messages ${query};`;
};

const createVisitDialogMessageQuery = () => {
  return `INSERT INTO visit_dialog_messages(text, sender, visitFeedbackId) VALUES(:text, :sender, :visitFeedbackId);`;
};

const updateVisitDialogMessageQuery = (visitDialogMessage: { id: number } & Partial<IVisitDialogMessage>) => {
  const keys = Object.keys(visitDialogMessage).filter((key) => (visitDialogMessage as any)[key] !== undefined);
  const query = keys.map((key) => `${key} = :${key} `).join(", ");

  return `UPDATE visit_dialog_messages SET ${query} WHERE id = :id;`;
};

export { getVisitDialogMessagesQuery, createVisitDialogMessageQuery, updateVisitDialogMessageQuery };
