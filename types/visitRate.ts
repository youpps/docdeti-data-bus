interface IVisitRate {
  id: number;
  visitId: string;
  didDoctorIntroduceThemselves: number | null;
  didDoctorGreetPatient: number | null;
  didDoctorUseOpenQuestion: number | null;
  didDoctorCommentOnObservations: number | null;
  didDoctorExplainResultInterpreterAndSpecialty: number | null;
  didDoctorExplainWhereToFindReport: number | null;
  wasDoctorEmpathetic: number | null;
  patientNegativeExperienceSummary: string | null;
  referralToAnotherClinicSummary: string | null;
}

export { IVisitRate };
