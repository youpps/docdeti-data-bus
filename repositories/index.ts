import mysql from "mysql2/promise";
import { VisitsRepository } from "./visitsRepository";
import { WebhooksRepository } from "./webhooksRepository";
import { ConnectorsRepository } from "./connectorsRepository";
import { VisitWebhookStatusesRepository } from "./visitWebhookStatusRepository";
import { VisitRatesRepository } from "./visitRatesRepository";
import { VisitDialogMessagesRepository } from "./visitDialogMessagesRepository";

class Repositories {
  private static pool: mysql.Pool;

  readonly visitsRepository: VisitsRepository;
  readonly visitWebhookStatusesRepository: VisitWebhookStatusesRepository;
  readonly visitRatesRepository: VisitRatesRepository;
  readonly visitDialogMessagesRepository: VisitDialogMessagesRepository;
  readonly webhooksRepository: WebhooksRepository;
  readonly connectorsRepository: ConnectorsRepository;

  constructor(connection: mysql.Pool | mysql.PoolConnection) {
    this.visitsRepository = new VisitsRepository(connection);
    this.visitRatesRepository = new VisitRatesRepository(connection);
    this.visitDialogMessagesRepository = new VisitDialogMessagesRepository(connection);
    this.visitWebhookStatusesRepository = new VisitWebhookStatusesRepository(connection);
    this.webhooksRepository = new WebhooksRepository(connection);
    this.connectorsRepository = new ConnectorsRepository();
  }

  static initialize(pool: mysql.Pool): Repositories {
    Repositories.pool = pool;
    return new Repositories(pool);
  }

  async getTransactionalRepositories(): Promise<{
    repositories: Repositories;
    commit: () => Promise<void>;
    rollback: () => Promise<void>;
    release: () => void;
  }> {
    const connection = await Repositories.pool.getConnection();
    await connection.beginTransaction();

    return {
      repositories: new Repositories(connection),
      commit: async () => {
        await connection.commit();
      },
      rollback: async () => {
        await connection.rollback();
      },
      release: () => {
        connection.release();
      },
    };
  }
}

export { Repositories };
