import { Repositories } from "../repositories";
import { processVisitToWebhook } from "../types/visitWebhookStatus";

class ProcessRequestsToWebhooks {
  static async launch(repositories: Repositories) {
    try {
      // Get requests, which hve not sent yet
      const visitWebhookStatuses = await repositories.visitWebhookStatusesRepository.getAll({
        isSent: 0,
      });

      await Promise.allSettled(
        visitWebhookStatuses.map((visitWebhookStatus) => processVisitToWebhook(repositories, visitWebhookStatus))
      );
    } catch (error) {
      console.log(error);
    }
  }
}

export { ProcessRequestsToWebhooks };
