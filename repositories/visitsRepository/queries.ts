import { IVisit } from "../../types/visit";

const getVisitsQuery = (visit: Partial<IVisit>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);

  const query = keys.length ? `WHERE ` + keys.map((key) => `${key} = :${key} `).join(" AND ") : "";

  return `SELECT id, parent, child, type, recordUrl, processedAt, date, phone, comment, doctor, address FROM visits ${query};`;
};

const createVisitQuery = () => {
  return `INSERT INTO visits(
    parent,
    child,
    type,
    recordUrl,
    processedAt,
    date,
    phone,
    comment,
    doctor,
    isLast,
    address) VALUES(
        :parent,
        :child,
        :type,
        :recordUrl,
        :processedAt,
        :date,
        :phone,
        :comment,
        :doctor,
        :isLast,
        :address
    )`;
};

const updateVisitQuery = (visit: { id: number } & Partial<IVisit>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);
  const query = keys.map((key) => `${key} = :${key} `).join(", ");

  return `UPDATE visits SET ${query} WHERE id = :id;`;
};

export { getVisitsQuery, createVisitQuery, updateVisitQuery };
