import { IVisit } from "../../types/visit";
import { IVisitDialogMessage } from "../../types/visitDialogMessage";
import { IVisitRate } from "../../types/visitRate";

class ConnectorsRepository {
  constructor() {}

  async saveFeedback(visit: IVisit, visitDialogMessages: IVisitDialogMessage[]): Promise<boolean> {
    return true;
  }

  async saveProtocol(visit: IVisit): Promise<boolean> {
    return true;
  }

  async saveRate(visitRate: IVisitRate): Promise<boolean> {
    return true;
  }
}

export { ConnectorsRepository };
