const getWebhooksQuery = () => {
  return `SELECT url FROM webhooks;`;
};

export {getWebhooksQuery}