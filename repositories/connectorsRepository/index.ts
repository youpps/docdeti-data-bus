import { Status } from "../../types/status";
import { IVisit } from "../../types/visit";
import { IVisitDialogMessage } from "../../types/visitDialogMessage";
import { IVisitFeedback, VisitFeedbackType } from "../../types/visitFeedback";
import { IVisitRate } from "../../types/visitRate";

class ConnectorsRepository {
  constructor() {}

  async saveFeedback(
    visit: IVisit,
    visitFeedback: IVisitFeedback,
    visitDialogMessages: IVisitDialogMessage[]
  ): Promise<boolean> {
    try {
      switch (visitFeedback.type) {
        case VisitFeedbackType.Positive: {
          const res = await fetch(process.env.GOOGLE_DOCS_CONNECTOR_URL + "/api/feedback", {
            method: "POST",
            body: JSON.stringify({
              type: visitFeedback.type,
              summary: visitFeedback.summary,
              dialog: visitDialogMessages,
              patient: visit.child || visit.parent,
              phone: visit.phone,
              date: visit.date,
              processedAt: visit.processedAt,
              doctor: visit.doctor,
              address: visit.address,
            }),
          });

          const json = await res.json();

          console.log(json);

          return json.status === Status.Success;
        }

        case VisitFeedbackType.Negative: {
          const res = await fetch(process.env.ONE_FORMA_CONNECTOR_URL + "/api/feedback", {
            method: "POST",
            body: JSON.stringify({
              type: visitFeedback.type,
              summary: visitFeedback.summary,
              dialog: visitDialogMessages,
              fullname: visit.child || visit.parent,
              phone: visit.phone,
              date: visit.date,
            }),
          });

          const json = await res.json();

          console.log(json);

          return json.status === Status.Success;
        }
      }

      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  //     address: Joi.string().min(1).required(),

  async saveProtocol(visit: IVisit): Promise<boolean> {
    return true;
  }

  async saveRate(visitRate: IVisitRate): Promise<boolean> {
    return true;
  }
}

export { ConnectorsRepository };
