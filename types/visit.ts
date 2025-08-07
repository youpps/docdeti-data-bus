enum VisitType {
  Nurse = "nurse",
  Doctor = "doctor",
}

enum VisitFeedbackType {
  Positive = "positive",
  Negative = "negative",
  Nopurpose = "nopurpose",
  Warning = "warning",
  Commercial = "commercial",
}

interface IVisit {
  id: string;
  parent: string | null;
  child: string | null;
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

  feedbackType: VisitFeedbackType | null;
  feedbackSummary: string | null;
  protocol: string | null;
  isFeedbackSent: 1 | 0;
  isProtocolSent: 1 | 0;
  isRateSent: 1 | 0;
}

type IInitialVisit = Omit<
  IVisit,
  "feedbackType" | "feedbackSummary" | "protocol" | "isFeedbackSent" | "isProtocolSent" | "isRateSent"
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

export { IInitialVisit, IVisit, toInitialVisit, VisitFeedbackType, VisitType };
