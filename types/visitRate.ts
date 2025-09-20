interface IVisitRate {
  id: number;
  visitId: string;
  didDoctorIntroduceThemselves: 1 | 0;
  didDoctorGreetPatient: 1 | 0;
  didDoctorIdentifyPatient: 1 | 0;
  didDoctorUseOpenQuestion: 1 | 0;
  didDoctorSummarizePatientInfo: 1 | 0;
  didDoctorClarifyAgenda: 1 | 0;
  didDoctorInterruptPatient: 1 | 0;
  didDoctorAskClarifyingQuestions: 1 | 0;
  didDoctorCheckPatientUnderstanding: 1 | 0;
  didDoctorExplainNextSteps: 1 | 0;
  didDoctorExplainWhereToFindReport: 1 | 0;
  wasDoctorEmpathetic: 1 | 0;
  referralToThisClinicSummary: string;
  referralToAnotherClinicSummary: string;
}

export { IVisitRate };
