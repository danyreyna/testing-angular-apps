import { HttpErrorResponse } from "@angular/common/http";
import { throwError } from "rxjs";
import {
  isRequiredPropertiesProblemDetail,
  isRfc9457ProblemDetail,
  type RequiredPropertiesProblemDetail,
  type Rfc9457ProblemDetail,
} from "../http/rfc-9457-problem-detail";
import { isObjectLike } from "../is-object-like";
import { handleError } from "./handle-error";

export type HandledHttpError = {
  message: string;
  httpErrorResponse: HttpErrorResponse;
};
export function isHandledHttpError(value: unknown): value is HandledHttpError {
  return (
    isObjectLike(value) &&
    typeof value["message"] === "string" &&
    value["httpErrorResponse"] instanceof HttpErrorResponse
  );
}

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

function getHttpErrorMessage(httpErrorResponse: HttpErrorResponse) {
  const { error } = httpErrorResponse;

  if (isRequiredPropertiesProblemDetail(error)) {
    return getRequiredPropertiesProblemDetailMessage(error);
  }

  if (isRfc9457ProblemDetail(error)) {
    return getProblemDetailMessage(error);
  }

  if (error?.message !== undefined) {
    return error.message;
  }

  return `Backend returned ${httpErrorResponse.status}: ${httpErrorResponse.message}`;
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
  handleError(observableError);

  if (observableError instanceof HttpErrorResponse) {
    return handleHttpError(observableError);
  }

  const handledObservableError: HandledObservableError = observableError;

  return throwError(() => handledObservableError);
}
