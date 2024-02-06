import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";

export type HandledObservableError =
  | { message: string; status: number }
  | { message: string };

function handleHttpError(errorResponse: HttpErrorResponse) {
  const isNetworkError =
    errorResponse.error instanceof ProgressEvent && errorResponse.status === 0;

  const message = isNetworkError
    ? "A network error occurred"
    : errorResponse.error?.message ??
      `Backend returned code ${errorResponse.status}: ${errorResponse.message}`;

  return throwError(() => ({ message, status: errorResponse.status }));
}

export function handleObservableError(
  observableError: Error | HttpErrorResponse,
) {
  // in a real world app, we may send the error to some remote logging infrastructure
  // instead of just logging it to the console
  console.error(observableError);

  if (observableError instanceof HttpErrorResponse) {
    return handleHttpError(observableError);
  }

  return throwError(() => ({ message: observableError.message }));
}
