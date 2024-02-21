import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";

export type HandledHttpError = { message: string; status: number };
export type HandledObservableError = HandledHttpError | { message: string };

function getHttpErrorMessage(errorResponse: HttpErrorResponse) {
  if (
    errorResponse.error?.title !== undefined ||
    errorResponse.error?.detail !== undefined
  ) {
    return `${errorResponse.error.title ?? ""}${
      errorResponse.error.detail === undefined
        ? ""
        : `: ${errorResponse.error.detail}`
    }`;
  }

  if (errorResponse.error?.message !== undefined) {
    return errorResponse.error.message;
  }

  return `Backend returned code ${errorResponse.status}: ${errorResponse.message}`;
}

function handleHttpError(errorResponse: HttpErrorResponse) {
  const isNetworkError =
    errorResponse.error instanceof ProgressEvent && errorResponse.status === 0;

  const message = isNetworkError
    ? "A network error occurred"
    : getHttpErrorMessage(errorResponse);

  return throwError(() => ({ message, status: errorResponse.status }));
}

export function handleObservableError(
  observableError: HttpErrorResponse | Error | HandledObservableError,
) {
  // in a real world app, we may send the error to some remote logging infrastructure
  // instead of just logging it to the console
  console.error(observableError);

  if (observableError instanceof HttpErrorResponse) {
    return handleHttpError(observableError);
  }

  if (observableError instanceof Error) {
    return throwError(() => ({ message: observableError.message }));
  }

  return throwError(() => observableError);
}
