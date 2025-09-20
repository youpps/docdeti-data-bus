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
  parent: IVisitClient;
  child: IVisitClient | null;
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
  isCancelled: 1 | 0;

  protocol: string | null;
  isProtocolSent: 1 | 0;
  isRateSent: 1 | 0;
}

type IInitialVisit = Omit<
  IVisit,
  "feedbackType" | "feedbackSummary" | "protocol" | "isFeedbackSent" | "isProtocolSent" | "isRateSent" | "isCancelled"
>;

const toInitialVisit = (visit: IVisit): IInitialVisit => {
  return {
    id: visit.id,
    parent: visit.parent,
    child: visit.child,
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

export { IInitialVisit, IVisit, toInitialVisit, VisitType, IVisitClient, VisitClientSex };
