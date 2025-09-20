import mysql from "mysql2/promise";
import { IInitialVisit, IVisit, VisitClientSex } from "../../types/visit";
import { createVisitQuery, getVisitsQuery, updateVisitQuery } from "./queries";

class VisitsRepository {
  constructor(private db: mysql.Pool | mysql.Connection) {}

  getAll = async (visit: Partial<IVisit>): Promise<IVisit[]> => {
    const [data]: any = await this.db.query(getVisitsQuery(visit), visit);

    return data;
  };

  getOne = async (visit: Partial<IVisit>): Promise<IVisit | null> => {
    const visits = await this.getAll(visit);

    return visits[0] ?? null;
  };

  create = async (visit: IInitialVisit) => {
    let correctVisit = {
      ...visit,
      parentName: visit.parent.name,
      parentSurname: visit.parent.surname,
      parentPatronymic: visit.parent.patronymic,
      parentSex: visit.parent.sex,
      parentAge: visit.parent.age,
      childName: visit.child?.name ?? null,
      childSurname: visit.child?.surname ?? null,
      childPatronymic: visit.child?.patronymic ?? null,
      childSex: visit.child?.sex ?? null,
      childAge: visit.child?.age ?? null,
    };

    delete (correctVisit as any)["parent"];
    delete (correctVisit as any)["child"];

    await this.db.query(createVisitQuery(), correctVisit);
  };

  update = async (visit: { id: string } & Partial<IVisit>) => {
    await this.db.query(updateVisitQuery(visit), visit);
  };
}

export { VisitsRepository };
