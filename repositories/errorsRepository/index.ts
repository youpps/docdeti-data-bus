import mysql from "mysql2/promise";
import { IError } from "../../types/error";
import { Status } from "../../types/status";

class ErrorsRepository {
  constructor(private db: mysql.Pool | mysql.Connection) {}

  private async sendErrorToHandler(error: IError) {
    const res = await fetch(process.env.ERRORS_HANDLER_URL + "/api/handle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(error),
    });

    const json = await res.json();

    return json.status === Status.Success;
  }

  private async createError(error: IError) {
    await this.db.query(createErrorQuery(), error);
  }

  async saveError(error: IError) {
    await Promise.allSettled([this.sendErrorToHandler(error), this.createError(error)]);
  }
}

export { ErrorsRepository };
