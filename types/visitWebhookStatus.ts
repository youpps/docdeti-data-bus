import { Repositories } from "../repositories";
import { Status } from "./status";
import { IVisit } from "./visit";

interface IVisitWebhookStatus {
  id: number;
  visitId: string;
  webhookUrl: string;
  isSent: 1 | 0;
  lastAttempt: Date;
  createdAt: Date;
}

const processVisitToWebhook = async (repositoriesObj: Repositories, visitWebhookStatus: IVisitWebhookStatus) => {
  if (visitWebhookStatus.isSent) return;

  const { repositories, commit, rollback, release } = await repositoriesObj.getTransactionalRepositories();

  try {
    const visit = await repositories.visitsRepository.getOne({
      id: visitWebhookStatus.visitId,
    });

    const res = await fetch(visitWebhookStatus.webhookUrl, {
      method: "POST",
      body: JSON.stringify(visit),
      headers: { "Content-Type": "application/json" },
    });

    const json = await res.json();

    if (json.status === Status.Success) {
      await repositories.visitWebhookStatusesRepository.update({
        id: visitWebhookStatus.id,
        isSent: 1,
      });
    }

    await commit();
  } catch (e) {
    console.log(e);

    await rollback();
  } finally {
    release();

    await repositoriesObj.visitWebhookStatusesRepository.update({
      id: visitWebhookStatus.id,
      lastAttempt: new Date(Date.now()),
    });
  }
};

const processProtocolToConnectors = async (repositories: Repositories, visit: IVisit): Promise<void> => {
  try {
    if (!visit.protocol) return;

    const protocolSent = await repositories.connectorsRepository.saveProtocol(visit);

    if (protocolSent) {
      await repositories.visitsRepository.update({
        id: visit.id,
        isProtocolSent: 1,
      });
    }
  } catch (error) {
    console.error(`Failed to process protocol for visit ${visit.id}:`, error);
  }
};

const processFeedbackToConnectors = async (repositories: Repositories, visit: IVisit): Promise<void> => {
  try {
    const visitFeedbacks = await repositories.visitFeedbacksRepository.getAll({
      visitId: visit.id,
      isSent: 0,
    });

    await Promise.allSettled(
      visitFeedbacks.map(async (visitFeedback) => {
        const visitDialogMessages = await repositories.visitDialogMessagesRepository.getAll({
          visitFeedbackId: visitFeedback.id,
        });

        if (!visitFeedback.summary || !visitFeedback.type || !visitDialogMessages.length) return;

        const feedbackSent = await repositories.connectorsRepository.saveFeedback(visitFeedback, visitDialogMessages);

        if (feedbackSent) {
          await repositories.visitFeedbacksRepository.update({
            id: visitFeedback.id,
            isSent: 1,
          });
        }
      })
    );
  } catch (error) {
    console.error(`Failed to process feedback for visit ${visit.id}:`, error);
  }
};

const processRateToConnectors = async (repositories: Repositories, visit: IVisit): Promise<void> => {
  try {
    const visitRate = await repositories.visitRatesRepository.getOne({
      visitId: visit.id,
    });

    if (!visitRate) return;

    const isRateDataComplete = Object.values(visitRate).every((value) => value !== null);
    if (!isRateDataComplete) return;

    const rateSent = await repositories.connectorsRepository.saveRate(visitRate);

    if (rateSent) {
      await repositories.visitsRepository.update({
        id: visit.id,
        isRateSent: 1,
      });
    }
  } catch (error) {
    console.error(`Failed to process rate for visit ${visit.id}:`, error);
  }
};

export {
  IVisitWebhookStatus,
  processFeedbackToConnectors,
  processProtocolToConnectors,
  processVisitToWebhook,
  processRateToConnectors,
};
