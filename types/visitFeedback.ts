enum VisitFeedbackType {
  Positive = "positive",
  Negative = "negative",
  Nopurpose = "nopurpose",
  Warning = "warning",
  Commercial = "commercial",
}

interface IVisitFeedback {
  id: number;
  type: VisitFeedbackType;
  summary: string;
  isSent: 1 | 0;
  visitId: string;
}

export { VisitFeedbackType, IVisitFeedback };
