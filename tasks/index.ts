import mysql from "mysql2/promise";
import { Repositories } from "../repositories";
import cron, { TaskOptions } from "node-cron";
import { ProcessRequestsToConnectors } from "./processRequestsToConnectors";
import { ProcessRequestsToWebhooks } from "./processRequestsToWebhooks";

class Tasks {
  private static TASK_OPTIONS: TaskOptions = {
    timezone: "Europe/Moscow",
  };

  private static PROCESS_TASK_EXPRESSION = "5 * * * *";

  static initialize(repositories: Repositories) {
    cron.schedule(
      Tasks.PROCESS_TASK_EXPRESSION,
      () => ProcessRequestsToConnectors.launch(repositories),
      Tasks.TASK_OPTIONS
    );

    cron.schedule(
      Tasks.PROCESS_TASK_EXPRESSION,
      () => ProcessRequestsToWebhooks.launch(repositories),
      Tasks.TASK_OPTIONS
    );
  }
}

export { Tasks };
