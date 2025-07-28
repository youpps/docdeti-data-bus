import { Router } from "express";
import { Controllers } from "../controllers";
import { Repositories } from "../repositories";

function routes(repositories: Repositories) {
  const router = Router();
  const controllers = new Controllers(repositories);

  // Webhook
  router.post("/visit", controllers.visitsController.visitWebhook);
  router.post("/visit/:visitId/feedback", controllers.visitsController.handleFeedback);
  router.post("/visit/:visitId/protocol", controllers.visitsController.handleProtocol);
  router.post("/visit/:visitId/rate", controllers.visitsController.handleRate);

  router.get("/visit/fake", controllers.visitsController.fakeVisit);

  // API
  //   router.post()
  return router;
}

export { routes };
