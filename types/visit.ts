enum VisitType {
  Nurse = "nurse",
  Doctor = "doctor",
}

enum VisitClientSex {
  Male = "male",
  Female = "female",
}

interface IVisitClient {
  name: string;
  surname: string;
  patronymic: string;
  sex: VisitClientSex;
  age: number;
}

interface IVisit {
  id: string;
  parentName: string;
  parentSurname: string;
  parentPatronymic: string;
  parentSex: VisitClientSex;
  parentAge: number;

  childName: string | null;
  childSurname: string | null;
  childPatronymic: string | null;
  childSex: VisitClientSex | null;
  childAge: number | null;

  type: VisitType;
  recordUrl: string;
  processedAt: Date;
  date: Date;
  phone: string;
  comment: string;
  doctor: string;
  address: string;
  specialization: string;
  serviceName: string;
  isLast: 1 | 0;

  protocol: string | null;
  isProtocolSent: 1 | 0;
  isRateSent: 1 | 0;
}

type IInitialVisit = Omit<
  IVisit,
  "feedbackType" | "feedbackSummary" | "protocol" | "isFeedbackSent" | "isProtocolSent" | "isRateSent"
>;

type IVisitDTO = Omit<
  IInitialVisit,
  | "parentName"
  | "parentSurname"
  | "parentPatronymic"
  | "parentSex"
  | "parentAge"
  | "childName"
  | "childSurname"
  | "childPatronymic"
  | "childSex"
  | "childAge"
> & {
  parent: IVisitClient;
  child: IVisitClient | null;
};

const toInitialVisit = (visit: IVisit): IVisitDTO => {
  return {
    id: visit.id,
    parent: {
      name: visit.parentName,
      surname: visit.parentSurname,
      patronymic: visit.parentPatronymic,
      age: visit.parentAge,
      sex: visit.parentSex,
    },
    child:
      !visit.childName || !visit.childSurname || !visit.childPatronymic || !visit.childAge || !visit.childSex
        ? null
        : {
            name: visit.childName,
            surname: visit.childSurname,
            patronymic: visit.childPatronymic,
            age: visit.childAge,
            sex: visit.childSex,
          },
    type: visit.type,
    recordUrl: visit.recordUrl,
    processedAt: visit.processedAt,
    date: visit.date,
    phone: visit.phone,
    comment: visit.comment,
    doctor: visit.doctor,
    address: visit.address,
    isLast: visit.isLast,
    specialization: visit.specialization,
    serviceName: visit.serviceName,
  };
};

export { IVisitDTO, IVisit, toInitialVisit, VisitType, IVisitClient, VisitClientSex, IInitialVisit };
