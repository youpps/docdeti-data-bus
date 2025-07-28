import mysql from "mysql2/promise";
import { getWebhooksQuery } from "./queries";
import { IWebhook } from "../../types/webhook";

class WebhooksRepository {
  constructor(private db: mysql.Pool | mysql.Connection) {}

  async getAll(): Promise<IWebhook[]> {
    const [data]: any = await this.db.query(getWebhooksQuery());

    return data;
  }
}

export { WebhooksRepository };
