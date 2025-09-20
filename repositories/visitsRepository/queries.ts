import { IVisit } from "../../types/visit";

const getVisitsQuery = (visit: Partial<IVisit>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);

  const query = keys.length ? `WHERE ` + keys.map((key) => `${key} = :${key} `).join(" AND ") : "";

  return `SELECT id, parent, child, type, recordUrl, processedAt, date, phone, comment, doctor, address, isLast, specialization, serviceName FROM visits ${query};`;
};

const createVisitQuery = () => {
  return `INSERT INTO visits(
    id,
    parentName,
    parentSurname,
    parentPatronymic,
    parentSex,
    parentAge,    
    childName,
    childSurname,
    childPatronymic,
    childSex,
    childAge,
    type,
    recordUrl,
    processedAt,
    date,
    phone,
    comment,
    doctor,
    isLast,
    specialization,
    serviceName,
    address
    ) VALUES(
        :id,
        :parentName,
        :parentSurname,
        :parentPatronymic,
        :parentSex,
        :parentAge,    
        :childName,
        :childSurname,
        :childPatronymic,
        :childSex,
        :childAge,
        :type,
        :recordUrl,
        :processedAt,
        :date,
        :phone,
        :comment,
        :doctor,
        :isLast,
        :specialization,
        :serviceName,
        :address
    )`;
};

const updateVisitQuery = (visit: { id: string } & Partial<IVisit>) => {
  const keys = Object.keys(visit).filter((key) => (visit as any)[key] !== undefined);
  const query = keys.map((key) => `${key} = :${key} `).join(", ");

  return `UPDATE visits SET ${query} WHERE id = :id;`;
};

export { getVisitsQuery, createVisitQuery, updateVisitQuery };
