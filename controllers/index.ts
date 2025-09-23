import { Repositories } from "../repositories";
import { ErrorsController } from "./errorsController";
import { VisitsController } from "./visitsController";

class Controllers {
  public visitsController: VisitsController;
  public errorsController: ErrorsController;

  constructor(repositories: Repositories) {
    this.visitsController = new VisitsController(repositories);
    this.errorsController = new ErrorsController(repositories);
  }
}

export { Controllers };
