import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";
import {
  isRequiredPropertiesProblemDetail,
  isRfc9457ProblemDetail,
  type RequiredPropertiesProblemDetail,
  type Rfc9457ProblemDetail,
} from "./rfc-9457-problem-detail";

export type HandledHttpError = {
  message: string;
  httpErrorResponse: HttpErrorResponse;
};
export type HandledObservableError = HandledHttpError | Error;

function getProblemDetailMessage(error: Rfc9457ProblemDetail) {
  return `${error.title ?? ""}${
    error.detail === undefined ? "" : `: ${error.detail}`
  }`;
}

function getRequiredPropertiesProblemDetailMessage(
  error: RequiredPropertiesProblemDetail,
) {
  return `${getProblemDetailMessage(error)}\n${error.errors
    .map(({ title, detail }) => `${title}: ${detail}`)
    .join("\n")}`;
}

function getHttpErrorMessage(errorResponse: HttpErrorResponse) {
  const { error } = errorResponse;

  if (isRequiredPropertiesProblemDetail(error)) {
    return getRequiredPropertiesProblemDetailMessage(error);
  }

  if (isRfc9457ProblemDetail(error)) {
    return getProblemDetailMessage(error);
  }

  if (errorResponse.error?.message !== undefined) {
    return errorResponse.error.message;
  }

  return `Backend returned ${errorResponse.status}: ${errorResponse.message}`;
}

function handleHttpError(httpErrorResponse: HttpErrorResponse) {
  const isNetworkError =
    httpErrorResponse.error instanceof ProgressEvent &&
    httpErrorResponse.status === 0;

  const message = isNetworkError
    ? "A network error occurred"
    : getHttpErrorMessage(httpErrorResponse);

  const handledHttpError: HandledHttpError = { message, httpErrorResponse };
  return throwError(() => handledHttpError);
}

export function handleObservableError(observableError: Error) {
  // in a real world app, we may send the error to some remote logging infrastructure
  // instead of just logging it to the console
  console.error(observableError);

  if (observableError instanceof HttpErrorResponse) {
    return handleHttpError(observableError);
  }

  const handledObservableError: HandledObservableError = observableError;

  return throwError(() => handledObservableError);
}
