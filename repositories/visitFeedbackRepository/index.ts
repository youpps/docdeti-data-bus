import mysql from "mysql2/promise";
import { createVisitFeedbackQuery, getVisitFeedbacksQuery, updateVisitFeedbackQuery } from "./queries";
import { IVisitFeedback } from "../../types/visitFeedback";

class VisitFeedbacksRepository {
  constructor(private db: mysql.Pool | mysql.Connection) {}

  async getAll(visitFeedback: Partial<IVisitFeedback>): Promise<IVisitFeedback[]> {
    const [data]: any = await this.db.query(getVisitFeedbacksQuery(visitFeedback), visitFeedback);

    return data;
  }

  async getOne(visitFeedback: Partial<IVisitFeedback>): Promise<IVisitFeedback | null> {
    const visitFeedbacks = await this.getAll(visitFeedback);

    return visitFeedbacks[0] ?? null;
  }

  async create(visitFeedback: Omit<IVisitFeedback, "id" | "isSent">): Promise<number> {
    const [data]: any = await this.db.query(createVisitFeedbackQuery(), visitFeedback);

    return data.insertId;
  }

  async update(visitFeedback: { id: number } & Partial<IVisitFeedback>) {
    await this.db.query(updateVisitFeedbackQuery(visitFeedback), visitFeedback);
  }
}

export { VisitFeedbacksRepository };
