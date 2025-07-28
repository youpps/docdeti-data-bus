enum VisitDialogMessageSender {
  Bot = "bot",
  User = "user",
}

interface IVisitDialogMessage {
  id: number;
  text: string;
  sender: VisitDialogMessageSender;
  visitId: number;
}

export { IVisitDialogMessage, VisitDialogMessageSender };
