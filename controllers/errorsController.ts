import { Request, Response } from "express";
import Joi from "joi";
import { Repositories } from "../repositories";
import { ErrorSeverity } from "../types/error";
import { Status } from "../types/status";

class ErrorsController {
  constructor(private repositories: Repositories) {}

  handle = async (req: Request, res: Response) => {
    try {
      const errorSchema = Joi.object({
        errorId: Joi.string().min(1).required(),
        occurredAt: Joi.date().iso().required(),
        serviceName: Joi.string().min(1).required(),
        severity: Joi.valid(ErrorSeverity.Error, ErrorSeverity.Warn).required(),
        message: Joi.string().min(1).required(),
      });

      const { error, value: data } = errorSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          status: Status.Error,
          data: { message: error.message },
        });
      }

      await this.repositories.errorsRepository.saveError(data)

      return res.status(200).json({
        status: Status.Success,
        data: { message: "Error has been successfully handled" },
      });
    } catch (error) {
      console.log("Visit webhook error:", error);

      return res.status(500).json({
        status: Status.Error,
        data: { message: "Internal server error" },
      });
    }
  };
}

export { ErrorsController };
