import mysql from "mysql2/promise";
import { IInitialVisit, IVisit } from "../../types/visit";
import { createVisitQuery, getVisitsQuery, updateVisitQuery } from "./queries";

class VisitsRepository {
  constructor(private db: mysql.Pool | mysql.Connection) {}

  async getAll(visit: Partial<IVisit>): Promise<IVisit[]> {
    const [data]: any = await this.db.query(getVisitsQuery(visit), visit);

    return data;
  }

  async getOne(visit: Partial<IVisit>): Promise<IVisit | null> {
    const visits = await this.getAll(visit);

    return visits[0] ?? null;
  }

  async create(visit: IInitialVisit): Promise<number> {
    const [data]: any = await this.db.query(createVisitQuery(), visit);

    return data.insertId;
  }

  async update(visit: { id: number } & Partial<IVisit>) {
    await this.db.query(updateVisitQuery(visit), visit);
  }
}

export { VisitsRepository };
