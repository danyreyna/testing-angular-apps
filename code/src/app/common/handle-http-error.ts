import { type HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";

export function handleHttpError(errorResponse: HttpErrorResponse) {
  // in a real world app, we may send the error to some remote logging infrastructure
  // instead of just logging it to the console
  console.error(errorResponse);

  const isNetworkError =
    errorResponse.error instanceof ProgressEvent && errorResponse.status === 0;

  const message = isNetworkError
    ? "A network error ocurred"
    : errorResponse.error?.message ??
      `Backend returned code ${errorResponse.status}: ${errorResponse.message}`;

  return throwError(() => ({ message, status: errorResponse.status }));
}
