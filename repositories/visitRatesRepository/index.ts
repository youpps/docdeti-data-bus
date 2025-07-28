import mysql from "mysql2/promise";
import { IVisitRate } from "../../types/visitRate";
import { createVisitRateQuery, getVisitRatesQuery, updateVisitRateQuery } from "./queries";

class VisitRatesRepository {
  constructor(private db: mysql.Pool | mysql.Connection) {}

  async getOne(visitRate: Partial<IVisitRate>): Promise<IVisitRate | null> {
    const [data]: any = await this.db.query(getVisitRatesQuery(visitRate), visitRate);

    return data[0] ?? null;
  }

  async create(visitRate: Pick<IVisitRate, "visitId">): Promise<number> {
    const [data]: any = await this.db.query(createVisitRateQuery(), visitRate);

    return data.insertId;
  }

  async update(visitRate: { id: number } & Partial<IVisitRate>) {
    await this.db.query(updateVisitRateQuery(visitRate), visitRate);
  }
}

export { VisitRatesRepository };
