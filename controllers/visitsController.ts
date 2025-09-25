import { Request, Response } from "express";
import Joi from "joi";
import { Repositories } from "../repositories";
import { Status } from "../types/status";
import { IVisitDTO, VisitClientSex, VisitType } from "../types/visit";
import { IVisitDialogMessage, VisitDialogMessageSender } from "../types/visitDialogMessage";
import { VisitFeedbackType } from "../types/visitFeedback";
import { IVisitWebhookStatus, processVisitToWebhook } from "../types/visitWebhookStatus";
import { WebhookType } from "../types/webhook";

class VisitsController {
  constructor(private repositories: Repositories) {}

  visitWebhook = async (req: Request, res: Response) => {
    try {
      const client = Joi.object({
        name: Joi.string().min(1).required(),
        surname: Joi.string().min(1).required(),
        patronymic: Joi.string().min(1).required(),
        sex: Joi.valid(VisitClientSex.Female, VisitClientSex.Male).required(),
        age: Joi.number().required(),
      });

      const visitSchema = Joi.object({
        id: Joi.string().min(1).required(),
        parent: client.required(),
        child: client.allow(null).required(),
        type: Joi.valid(VisitType.Doctor, VisitType.Nurse).required(),
        recordUrl: Joi.string().min(1).required(),
        processedAt: Joi.date().required(),
        date: Joi.date().required(),
        phone: Joi.string().min(1).required(),
        comment: Joi.string().required(),
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

      const existingVisit = await this.repositories.visitsRepository.getOne({ id: visitData.id });
      if (existingVisit) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit has already been handled" },
        });
      }

      const { repositories, commit, rollback, release } = await this.repositories.getTransactionalRepositories();

      try {
        const [webhooks] = await Promise.all([
          this.repositories.webhooksRepository.getAll({
            type: WebhookType.NewVisit,
          }),
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

        await Promise.allSettled(
          visitWebhookStatuses.map((status) => processVisitToWebhook(this.repositories, status))
        );
      } catch (e) {
        console.log(e);

        await rollback();

        return res.status(500).json({
          status: Status.Error,
          data: { message: "Internal server error" },
        });
      } finally {
        release();
      }

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Visit has been successfully handled" },
      });
    } catch (error) {
      console.log("Visit webhook error:", error);

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    }
  };

  visitCancel = async (req: Request, res: Response) => {
    try {
      const client = Joi.object({
        name: Joi.string().min(1).required(),
        surname: Joi.string().min(1).required(),
        patronymic: Joi.string().min(1).required(),
        sex: Joi.valid(VisitClientSex.Female, VisitClientSex.Male).required(),
        age: Joi.number().required(),
      });

      const visitSchema = Joi.object({
        id: Joi.string().min(1).required(),
        parent: client.required(),
        child: client.allow(null).required(),
        type: Joi.valid(VisitType.Doctor, VisitType.Nurse).required(),
        recordUrl: Joi.string().allow(null).min(1).required(),
        processedAt: Joi.date().allow(null).required(),
        date: Joi.date().required(),
        phone: Joi.string().min(1).required(),
        comment: Joi.string().required(),
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

      const existingVisit = await this.repositories.visitsRepository.getOne({ id: visitData.id });
      if (!existingVisit) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit is not found" },
        });
      }

      const webhooks = await this.repositories.webhooksRepository.getAll({
        type: WebhookType.CancelledVisit,
      });

      const { repositories, commit, rollback, release } = await this.repositories.getTransactionalRepositories();

      try {
        await repositories.visitsRepository.update({
          id: existingVisit.id,
          isCancelled: 1,
        });

        const visitWebhookStatusIds = await Promise.all(
          webhooks.map((webhook) =>
            repositories.visitWebhookStatusesRepository.create({
              webhookUrl: webhook.url,
              visitId: existingVisit.id,
            })
          )
        );

        await commit();

        const visitWebhookStatuses = (await Promise.all(
          visitWebhookStatusIds.map((id) => this.repositories.visitWebhookStatusesRepository.getOne({ id }))
        )) as IVisitWebhookStatus[];

        await Promise.allSettled(
          visitWebhookStatuses.map((status) => processVisitToWebhook(this.repositories, status))
        );
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

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Visit has been successfully handled" },
      });
    } catch (error) {
      console.log("Visit webhook error:", error);

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
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

      const visit = await this.repositories.visitsRepository.getOne({ id: params.visitId, isCancelled: 0 });
      if (!visit) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit is not found or been cancelled" },
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
        .catch(console.log);

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Protocol has been successfully saved" },
      });
    } catch (error) {
      console.log("Handle protocol error:", error);

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    }
  };

  handleRate = async (req: Request, res: Response) => {
    try {
      // Validate request
      const paramsSchema = Joi.object({ visitId: Joi.string().min(1).required() });

      const bodySchema = Joi.object({
        didDoctorIntroduceThemselves: Joi.valid(1, 0).required(),
        didDoctorGreetPatient: Joi.valid(1, 0).required(),
        didDoctorIdentifyPatient: Joi.valid(1, 0).required(),
        didDoctorUseOpenQuestion: Joi.valid(1, 0).required(),
        didDoctorSummarizePatientInfo: Joi.valid(1, 0).required(),
        didDoctorClarifyAgenda: Joi.valid(1, 0).required(),
        didDoctorInterruptPatient: Joi.valid(1, 0).required(),
        didDoctorAskClarifyingQuestions: Joi.valid(1, 0).required(),
        didDoctorCheckPatientUnderstanding: Joi.valid(1, 0).required(),
        didDoctorExplainNextSteps: Joi.valid(1, 0).required(),
        didDoctorExplainWhereToFindReport: Joi.valid(1, 0).required(),
        wasDoctorEmpathetic: Joi.valid(1, 0).required(),
        referralToThisClinicSummary: Joi.string().min(1).required(),
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
        this.repositories.visitsRepository.getOne({ id: params.visitId, isCancelled: 0 }),
        this.repositories.visitRatesRepository.getOne({ visitId: params.visitId }),
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
          data: { message: "Visit is not found or been cancelled" },
        });
      }

      if (visit.isRateSent) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Rate has already been sent" },
        });
      }

      await this.repositories.visitRatesRepository.create({
        didDoctorIntroduceThemselves: body.didDoctorIntroduceThemselves,
        didDoctorGreetPatient: body.didDoctorGreetPatient,
        didDoctorIdentifyPatient: body.didDoctorIdentifyPatient,
        didDoctorUseOpenQuestion: body.didDoctorUseOpenQuestion,
        didDoctorSummarizePatientInfo: body.didDoctorSummarizePatientInfo,
        didDoctorClarifyAgenda: body.didDoctorClarifyAgenda,
        didDoctorInterruptPatient: body.didDoctorInterruptPatient,
        didDoctorAskClarifyingQuestions: body.didDoctorAskClarifyingQuestions,
        didDoctorCheckPatientUnderstanding: body.didDoctorCheckPatientUnderstanding,
        didDoctorExplainNextSteps: body.didDoctorExplainNextSteps,
        didDoctorExplainWhereToFindReport: body.didDoctorExplainWhereToFindReport,
        wasDoctorEmpathetic: body.wasDoctorEmpathetic,
        referralToAnotherClinicSummary: body.referralToThisClinicSummary,
        referralToThisClinicSummary: body.referralToThisClinicSummary,
        visitId: visit.id,
      });

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
        .catch(console.log);

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Rate has been successfully saved" },
      });
    } catch (error) {
      console.log("Handle rate error:", error);

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
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
          VisitFeedbackType.Warning,
          VisitFeedbackType.Callback
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

      const visit = await this.repositories.visitsRepository.getOne({ id: params.visitId, isCancelled: 0 });
      if (!visit) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: "Visit is not found or been cancelled" },
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
            .catch(console.log);
        }

        await commit();
      } catch (e) {
        console.log(e);

        await rollback();

        return res.status(500).json({
          status: Status.Error,
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
      console.log("Handle feedback error:", error);
      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    }
  };

  fakeVisit = async (req: Request, res: Response) => {
    const testVisit: IVisitDTO = {
      id: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
      parent: {
        name: "Ольга",
        surname: "Смирнова",
        patronymic: "Александровна",
        sex: VisitClientSex.Female,
        age: 35,
      },
      child: {
        name: "Алексей",
        surname: "Смирнов",
        patronymic: "Павлович",
        sex: VisitClientSex.Female,
        age: 6,
      },
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
      console.log("Fake visit error:", error);
      res.status(500).json({
        status: Status.Error,
        data: { message: "Failed to create fake visit" },
      });
    }
  };
}

export { VisitsController };
