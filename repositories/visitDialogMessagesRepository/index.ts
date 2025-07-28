import mysql from "mysql2/promise";
import { IVisitDialogMessage } from "../../types/visitDialogMessage";
import { createVisitDialogMessageQuery, getVisitDialogMessagesQuery, updateVisitDialogMessageQuery } from "./queries";

class VisitDialogMessagesRepository {
  constructor(private db: mysql.Pool | mysql.Connection) {}

  async getAll(visitDialogMessage: Partial<IVisitDialogMessage>): Promise<IVisitDialogMessage[]> {
    const [data]: any = await this.db.query(getVisitDialogMessagesQuery(visitDialogMessage), visitDialogMessage);

    return data;
  }

  async getOne(visitDialogMessage: Partial<IVisitDialogMessage>): Promise<IVisitDialogMessage | null> {
    const visitDialogMessages = await this.getAll(visitDialogMessage);

    return visitDialogMessages[0] ?? null;
  }

  async create(visitDialogMessage: Omit<IVisitDialogMessage, "id">): Promise<number> {
    const [data]: any = await this.db.query(createVisitDialogMessageQuery(), visitDialogMessage);

    return data.insertId;
  }

  async update(visitDialogMessage: { id: number } & Partial<IVisitDialogMessage>) {
    await this.db.query(updateVisitDialogMessageQuery(visitDialogMessage), visitDialogMessage);
  }
}

export { VisitDialogMessagesRepository };
