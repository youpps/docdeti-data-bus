import { Repositories } from "../repositories";
import { IVisit } from "../types/visit";
import {
  processFeedbackToConnectors,
  processProtocolToConnectors,
  processRateToConnectors,
} from "../types/visitWebhookStatus";

class ProcessRequestsToConnectors {
  static async launch(repositories: Repositories): Promise<void> {
    try {
      const [feedbackVisits, protocolVisits, rateVisits] = await Promise.all([
        repositories.visitsRepository.getAll({}),
        repositories.visitsRepository.getAll({
          isProtocolSent: 0,
        }),
        repositories.visitsRepository.getAll({
          isRateSent: 0,
        }),
      ]);

      await Promise.allSettled([
        ...feedbackVisits.map((visit) => processFeedbackToConnectors(repositories, visit)),
        ...protocolVisits.map((visit) => processProtocolToConnectors(repositories, visit)),
        ...rateVisits.map((visit) => processRateToConnectors(repositories, visit)),
      ]);
    } catch (error) {
      console.error("Failed to process feedback:", error);
    }
  }
}

export { ProcessRequestsToConnectors };
