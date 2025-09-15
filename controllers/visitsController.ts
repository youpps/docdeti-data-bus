import { Request, Response } from "express";
import Joi from "joi";
import { Repositories } from "../repositories";
import { Status } from "../types/status";
import { IInitialVisit, VisitType } from "../types/visit";
import { IVisitDialogMessage, VisitDialogMessageSender } from "../types/visitDialogMessage";
import { IVisitWebhookStatus, processVisitToWebhook } from "../types/visitWebhookStatus";
import { VisitFeedbackType } from "../types/visitFeedback";

class VisitsController {
  constructor(private repositories: Repositories) {}

  visitWebhook = async (req: Request, res: Response) => {
    const { repositories, commit, rollback, release } = await this.repositories.getTransactionalRepositories();

    try {
      const visitSchema = Joi.object({
        id: Joi.string().min(1).required(),
        parent: Joi.string().allow(null).min(1).required(),
        child: Joi.string().allow(null).min(1).required(),
        type: Joi.valid(VisitType.Doctor, VisitType.Nurse).required(),
        recordUrl: Joi.string().min(1).required(),
        processedAt: Joi.date().required(),
        date: Joi.date().required(),
        phone: Joi.string().min(1).required(),
        comment: Joi.string().min(1).required(),
        doctor: Joi.string().min(1).required(),
        address: Joi.string().min(1).required(),
        specialization: Joi.string().min(1).required(),
        serviceName: Joi.string().min(1).required(),
        isLast: Joi.valid(1, 0).required(),
      });

      const { error: validationError, value: visitData } = visitSchema.validate(req.body);
      if (validationError) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: validationError.message },
        });
      }

      const existingVisit = await repositories.visitsRepository.getOne({ id: visitData.id });
      if (existingVisit) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit has already been handled" },
        });
      }

      const [webhooks] = await Promise.all([
        repositories.webhooksRepository.getAll(),
        repositories.visitsRepository.create(visitData),
      ]);

      const visitWebhookStatusIds = await Promise.all(
        webhooks.map((webhook) =>
          repositories.visitWebhookStatusesRepository.create({
            webhookUrl: webhook.url,
            visitId: visitData.id,
          })
        )
      );

      await commit();

      const visitWebhookStatuses = (await Promise.all(
        visitWebhookStatusIds.map((id) => this.repositories.visitWebhookStatusesRepository.getOne({ id }))
      )) as IVisitWebhookStatus[];

      await Promise.allSettled(visitWebhookStatuses.map((status) => processVisitToWebhook(this.repositories, status)));

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Visit has been successfully handled" },
      });
    } catch (error) {
      console.error("Visit webhook error:", error);

      await rollback();

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    } finally {
      release();
    }
  };

  visitCancel = async (req: Request, res: Response) => {
    const { repositories, commit, rollback, release } = await this.repositories.getTransactionalRepositories();

    try {
      const visitSchema = Joi.object({
        id: Joi.string().min(1).required(),
        parent: Joi.string().allow(null).min(1).required(),
        child: Joi.string().allow(null).min(1).required(),
        type: Joi.valid(VisitType.Doctor, VisitType.Nurse).required(),
        recordUrl: Joi.string().allow(null).min(1).required(),
        processedAt: Joi.date().allow(null).required(),
        date: Joi.date().required(),
        phone: Joi.string().min(1).required(),
        comment: Joi.string().min(1).required(),
        doctor: Joi.string().min(1).required(),
        address: Joi.string().min(1).required(),
        specialization: Joi.string().min(1).required(),
        serviceName: Joi.string().min(1).required(),
        isLast: Joi.valid(1, 0).required(),
      });

      const { error: validationError, value: visitData } = visitSchema.validate(req.body);
      if (validationError) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: validationError.message },
        });
      }

      const existingVisit = await repositories.visitsRepository.getOne({ id: visitData.id, isCancelled: 0 });
      if (existingVisit) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit is not found or been cancelled" },
        });
      }

      const [webhooks] = await Promise.all([
        repositories.webhooksRepository.getAll(),
        repositories.visitsRepository.create(visitData),
      ]);

      const visitWebhookStatusIds = await Promise.all(
        webhooks.map((webhook) =>
          repositories.visitWebhookStatusesRepository.create({
            webhookUrl: webhook.url,
            visitId: visitData.id,
          })
        )
      );

      await commit();

      const visitWebhookStatuses = (await Promise.all(
        visitWebhookStatusIds.map((id) => this.repositories.visitWebhookStatusesRepository.getOne({ id }))
      )) as IVisitWebhookStatus[];

      await Promise.allSettled(visitWebhookStatuses.map((status) => processVisitToWebhook(this.repositories, status)));

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Visit has been successfully handled" },
      });
    } catch (error) {
      console.log("Visit webhook error:", error);

      await rollback();

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    } finally {
      release();
    }
  };

  handleProtocol = async (req: Request, res: Response) => {
    try {
      const paramsSchema = Joi.object({ visitId: Joi.string().min(1).required() });
      const bodySchema = Joi.object({ protocol: Joi.string().min(1).required() });

      const { error: paramsError, value: params } = paramsSchema.validate(req.params);
      const { error: bodyError, value: body } = bodySchema.validate(req.body);

      if (paramsError || bodyError) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: (paramsError || bodyError)?.message },
        });
      }

      const visit = await this.repositories.visitsRepository.getOne({ id: params.visitId });
      if (!visit) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit is not found" },
        });
      }

      if (visit.isProtocolSent) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Protocol has already been sent" },
        });
      }

      await this.repositories.visitsRepository.update({
        id: visit.id,
        protocol: body.protocol,
      });

      this.repositories.connectorsRepository
        .saveProtocol(body.protocol)
        .then((isOk) => {
          if (!isOk) return;

          this.repositories.visitsRepository.update({
            id: visit.id,
            isProtocolSent: 1,
          });
        })
        .catch(console.error);

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Protocol has been successfully saved" },
      });
    } catch (error) {
      console.error("Handle protocol error:", error);

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    }
  };

  handleRate = async (req: Request, res: Response) => {
    const { repositories, commit, rollback, release } = await this.repositories.getTransactionalRepositories();

    try {
      // Validate request
      const paramsSchema = Joi.object({ visitId: Joi.string().min(1).required() });

      const bodySchema = Joi.object({
        didDoctorIntroduceThemselves: Joi.valid(1, 0).required(),
        didDoctorGreetPatient: Joi.valid(1, 0).required(),
        didDoctorUseOpenQuestion: Joi.valid(1, 0).required(),
        didDoctorCommentOnObservations: Joi.valid(1, 0).required(),
        didDoctorExplainResultInterpreterAndSpecialty: Joi.valid(1, 0).required(),
        didDoctorExplainWhereToFindReport: Joi.valid(1, 0).required(),
        wasDoctorEmpathetic: Joi.valid(1, 0).required(),
        patientNegativeExperienceSummary: Joi.string().min(1).required(),
        referralToAnotherClinicSummary: Joi.string().min(1).required(),
      });

      const { error: paramsError, value: params } = paramsSchema.validate(req.params);
      const { error: bodyError, value: body } = bodySchema.validate(req.body);

      if (paramsError || bodyError) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: (paramsError || bodyError)?.message },
        });
      }

      const [visit, visitRate] = await Promise.all([
        repositories.visitsRepository.getOne({ id: params.visitId }),
        repositories.visitRatesRepository.getOne({ visitId: params.visitId }),
      ]);

      if (visitRate) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit rate has already been passed" },
        });
      }

      if (!visit) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit is not found" },
        });
      }

      if (visit.isRateSent) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Rate has already been sent" },
        });
      }

      await repositories.visitRatesRepository.create({
        didDoctorCommentOnObservations: body.didDoctorCommentOnObservations,
        didDoctorExplainResultInterpreterAndSpecialty: body.didDoctorExplainResultInterpreterAndSpecialty,
        didDoctorExplainWhereToFindReport: body.didDoctorExplainWhereToFindReport,
        didDoctorGreetPatient: body.didDoctorGreetPatient,
        didDoctorIntroduceThemselves: body.didDoctorIntroduceThemselves,
        didDoctorUseOpenQuestion: body.didDoctorUseOpenQuestion,
        wasDoctorEmpathetic: body.wasDoctorEmpathetic,
        patientNegativeExperienceSummary: body.patientNegativeExperienceSummary,
        referralToAnotherClinicSummary: body.referralToAnotherClinicSummary,
        visitId: visit.id,
      });

      await commit();

      // Save rate to external system (fire and forget)
      this.repositories.connectorsRepository
        .saveRate(body)
        .then((isOk) => {
          if (!isOk) return;

          this.repositories.visitsRepository.update({
            id: visit.id,
            isRateSent: 1,
          });
        })
        .catch(console.error);

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Rate has been successfully saved" },
      });
    } catch (error) {
      console.error("Handle rate error:", error);

      await rollback();

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    } finally {
      release();
    }
  };

  handleFeedback = async (req: Request, res: Response) => {
    try {
      const paramsSchema = Joi.object({ visitId: Joi.string().min(1).required() });

      const dialogSchema = Joi.object({
        text: Joi.string().min(1).required(),
        sender: Joi.valid(VisitDialogMessageSender.Bot, VisitDialogMessageSender.User).required(),
      });

      const bodySchema = Joi.object({
        type: Joi.valid(
          VisitFeedbackType.Commercial,
          VisitFeedbackType.Negative,
          VisitFeedbackType.Nopurpose,
          VisitFeedbackType.Positive,
          VisitFeedbackType.Warning
        ).required(),
        summary: Joi.string().min(1).required(),
        dialog: Joi.array().min(1).items(dialogSchema),
      });

      const { error: paramsError, value: params } = paramsSchema.validate(req.params);
      const { error: bodyError, value: body } = bodySchema.validate(req.body);

      if (paramsError || bodyError) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: (paramsError || bodyError)?.message },
        });
      }

      const visit = await this.repositories.visitsRepository.getOne({ id: params.visitId });
      if (!visit) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit is not found" },
        });
      }

      const dialog: Pick<IVisitDialogMessage, "sender" | "text">[] = body.dialog;

      const { repositories, release, rollback, commit } = await this.repositories.getTransactionalRepositories();

      try {
        const visitFeedbackId = await repositories.visitFeedbacksRepository.create({
          type: body.type,
          summary: body.summary,
          visitId: visit.id,
        });

        for (let dialogMessage of dialog) {
          await repositories.visitDialogMessagesRepository.create({
            sender: dialogMessage.sender,
            text: dialogMessage.text,
            visitFeedbackId: visitFeedbackId,
          });
        }

        const [newVisitFeedback, newVisitDialogMessages] = await Promise.all([
          repositories.visitFeedbacksRepository.getOne({
            id: visitFeedbackId,
          }),
          repositories.visitDialogMessagesRepository.getAll({
            visitFeedbackId,
          }),
        ]);

        console.log(visitFeedbackId, newVisitFeedback);

        if (newVisitFeedback && newVisitDialogMessages.length) {
          this.repositories.connectorsRepository
            .saveFeedback(visit, newVisitFeedback, newVisitDialogMessages)
            .then((isOk) => {
              if (!isOk) return;

              this.repositories.visitFeedbacksRepository.update({
                id: visitFeedbackId,
                isSent: 1,
              });
            })
            .catch(console.error);
        }

        await commit();
      } catch (error) {
        console.log(error);

        await rollback();

        return res.status(500).json({
          status: Status.Success,
          data: { message: "Internal server error" },
        });
      } finally {
        release();
      }

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Feedback has been successfully saved" },
      });
    } catch (error) {
      console.error("Handle feedback error:", error);
      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    }
  };

  fakeVisit = async (req: Request, res: Response) => {
    const testVisit: IInitialVisit = {
      id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
      parent: "Ольга Смирнова",
      child: "Дарья Смирнова",
      type: VisitType.Doctor,
      recordUrl: "test-record",
      processedAt: new Date("2025-07-31T14:30:00Z"),
      date: new Date("2025-07-31T14:30:00Z"),
      phone: "+79999999999",
      comment: "test-comment",
      doctor: "Ильина Анна",
      address: "г. Москва, ул. Мясницкая",
      specialization: "Гинеколог",
      serviceName: "Прием (осмотр, консультация) врача-акушера-гинеколога первичный (группа А)",
      isLast: 1,
    };

    try {
      const response = await fetch("http://localhost:4600/api/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testVisit),
      });

      const json = await response.json();

      if (json.status === Status.Error) return res.status(500).json(json);

      res.status(200).json(testVisit);
    } catch (error) {
      console.error("Fake visit error:", error);
      res.status(500).json({
        status: Status.Error,
        data: { message: "Failed to create fake visit" },
      });
    }
  };
}

export { VisitsController };
