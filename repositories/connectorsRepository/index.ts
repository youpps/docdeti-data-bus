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
      const correctDialog = visitDialogMessages.map(({ sender, text }) => ({ sender, text }));

      switch (visitFeedback.type) {
        case VisitFeedbackType.Positive: {
          const res = await fetch(process.env.GOOGLE_DOCS_CONNECTOR_URL + "/api/feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: visitFeedback.type,
              summary: visitFeedback.summary,
              dialog: correctDialog,
              patient: visit.child || visit.parent,
              phone: visit.phone,
              date: visit.date,
              processedAt: visit.processedAt,
              doctor: visit.doctor,
              address: visit.address,
            }),
          });

          const json = await res.json();

          return json.status === Status.Success;
        }

        case VisitFeedbackType.Negative: {
          const res = await fetch(process.env.ONE_FORMA_CONNECTOR_URL + "/api/feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: visitFeedback.type,
              summary: visitFeedback.summary,
              dialog: correctDialog,
              fullname: visit.child || visit.parent,
              phone: visit.phone,
              date: visit.date,
            }),
          });

          const json = await res.json();

          return json.status === Status.Success;
        }
        case VisitFeedbackType.Commercial:
        case VisitFeedbackType.Warning:
        case VisitFeedbackType.Callback: {
          const res = await fetch(process.env.AMO_CONNECTOR_URL + "/api/feedback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: visitFeedback.type,
              summary: visitFeedback.summary,
              dialog: correctDialog,
              phone: visit.phone,
              date: visit.date,
              fullname: visit.child || visit.parent,
            }),
          });

          const json = await res.json();

          return json.status === Status.Success;
        }

        case VisitFeedbackType.Nopurpose: {
          break;
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
