enum VisitDialogMessageSender {
  Bot = "bot",
  User = "user",
}

interface IVisitDialogMessage {
  id: number;
  text: string;
  sender: VisitDialogMessageSender;
  visitFeedbackId: number;
}

export { IVisitDialogMessage, VisitDialogMessageSender };
