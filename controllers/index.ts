import { Repositories } from "../repositories";
import { VisitsController } from "./visitsController";

class Controllers {
  public visitsController: VisitsController;

  constructor(repositories: Repositories) {
    this.visitsController = new VisitsController(repositories);
  }
}

export { Controllers };
