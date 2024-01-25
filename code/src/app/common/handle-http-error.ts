import { type HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";

export function handleHttpError(errorResponse: HttpErrorResponse) {
  const isNetworkError =
    errorResponse.error instanceof ProgressEvent && errorResponse.status === 0;

  const message = isNetworkError
    ? "A network error ocurred"
    : `Backend returned code ${errorResponse.status}: ${errorResponse.message}`;

  // in a real world app, we may send the error to some remote logging infrastructure
  // instead of just logging it to the console
  console.error(errorResponse);

  return throwError(() => ({ message, status: errorResponse.status }));
}
