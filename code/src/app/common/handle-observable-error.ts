import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";

export type HandledObservableError = { message: string; status?: number };

export function handleObservableError(
  observableError: Error | HttpErrorResponse,
) {
  // in a real world app, we may send the error to some remote logging infrastructure
  // instead of just logging it to the console
  console.error(observableError);

  if (observableError instanceof HttpErrorResponse) {
    const isNetworkError =
      observableError.error instanceof ProgressEvent &&
      observableError.status === 0;

    const message = isNetworkError
      ? "A network error occurred"
      : observableError.error?.message ??
        `Backend returned code ${observableError.status}: ${observableError.message}`;

    return throwError(() => ({ message, status: observableError.status }));
  }

  return throwError(() => ({ message: observableError.message }));
}
