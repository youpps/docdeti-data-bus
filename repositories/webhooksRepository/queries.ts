import { IWebhook } from "../../types/webhook";

const getWebhooksQuery = (webhook: Partial<IWebhook>) => {
  const keys = Object.keys(webhook).filter((key) => (webhook as any)[key] !== undefined);

  const query = keys.length ? `WHERE ` + keys.map((key) => `${key} = :${key} `).join(" AND ") : "";

  return `SELECT url FROM webhooks ${query};`;
};

export { getWebhooksQuery };
