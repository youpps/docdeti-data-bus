enum WebhookType {
  NewVisit = "newVisit",
  CancelledVisit = "cancelledVisit",
}

interface IWebhook {
  url: string;
  type: WebhookType;
}

export { IWebhook, WebhookType };
