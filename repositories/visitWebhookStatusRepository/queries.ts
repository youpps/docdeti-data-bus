import { IVisit } from "../../types/visit";
import { IVisitWebhookStatus } from "../../types/visitWebhookStatus";

const getVisitWebhookStatuses = (visit: Partial<IVisitWebhookStatus>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);

  const query = keys.length ? `WHERE ` + keys.map((key) => `${key} = :${key} `).join(" AND ") : "";

  return `SELECT id, visitId, webhookUrl, isSent, lastAttempt FROM visit_webhook_status ${query};`;
};

const createVisitWebhookStatusQuery = () => {
  return `INSERT INTO visit_webhook_status(
    visitId,
    webhookUrl) VALUES(
       :visitId,
       :webhookUrl
    )`;
};

const updateVisitWebhookStatusQuery = (visit: { id: number } & Partial<IVisitWebhookStatus>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);
  const query = keys.map((key) => `${key} = :${key} `).join(", ");

  return `UPDATE visit_webhook_status SET ${query} WHERE id = :id;`;
};

export { getVisitWebhookStatuses, createVisitWebhookStatusQuery, updateVisitWebhookStatusQuery };
