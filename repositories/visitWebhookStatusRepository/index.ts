import mysql from "mysql2/promise";
import { IVisitWebhookStatus } from "../../types/visitWebhookStatus";
import { createVisitWebhookStatusQuery, getVisitWebhookStatuses, updateVisitWebhookStatusQuery } from "./queries";

class VisitWebhookStatusesRepository {
  constructor(private db: mysql.Pool | mysql.Connection) {}

  async getAll(visitWebhookStatus: Partial<IVisitWebhookStatus>): Promise<IVisitWebhookStatus[]> {
    const [data]: any = await this.db.query(getVisitWebhookStatuses(visitWebhookStatus), visitWebhookStatus);

    return data;
  }

  async getOne(visitWebhookStatus: Partial<IVisitWebhookStatus>): Promise<IVisitWebhookStatus | null> {
    const visits = await this.getAll(visitWebhookStatus);

    return visits[0];
  }

  async create(
    visitWebhookStatus: Omit<IVisitWebhookStatus, "id" | "isSent" | "lastAttempt" | "createdAt">
  ): Promise<number> {
    const [data]: any = await this.db.query(createVisitWebhookStatusQuery(), visitWebhookStatus);

    return data.insertId;
  }

  async update(visitWebhookStatus: { id: number } & Partial<IVisitWebhookStatus>) {
    await this.db.query(updateVisitWebhookStatusQuery(visitWebhookStatus), visitWebhookStatus);
  }
}

export { VisitWebhookStatusesRepository };
