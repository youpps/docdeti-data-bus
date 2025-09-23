enum ErrorSeverity {
  Error = "error",
  Warn = "warn",
}

interface IError {
  errorId: string;
  occurredAt: Date;
  serviceName: string;
  severity: ErrorSeverity;
  message: string;
}

export { IError, ErrorSeverity };
