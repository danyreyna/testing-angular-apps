import { HttpResponse } from "@angular/common/http";
import {
  type HandledObservableError,
  isHandledHttpError,
} from "../../error/handle-observable-error";
import type { JsonTypes } from "../../http/json-types";
import { isObjectLike } from "../../is-object-like";
import type {
  HttpResponseWithNonNullBody,
  RequestHeaders,
  UrlParams,
} from "./types";

export type HttpQueryContext<
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
> = {
  urlParams: TUrlParams;
  headers: THeaders;
};

const PENDING_STATE = "pending";
export type HttpQueryPendingState = { state: typeof PENDING_STATE };

const ERROR_STATE = "error";
export type HttpQueryErrorState<
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
> = {
  state: typeof ERROR_STATE;
  error: HandledObservableError;
  context: HttpQueryContext<TUrlParams, THeaders>;
};

const SUCCESS_STATE = "success";
export type HttpQuerySuccessState<
  TResponseBody extends JsonTypes,
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
> = {
  state: typeof SUCCESS_STATE;
  response: HttpResponseWithNonNullBody<TResponseBody>;
  context: HttpQueryContext<TUrlParams, THeaders>;
};

type HttpState<
  TResponseBody extends JsonTypes,
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
> =
  | HttpQueryPendingState
  | HttpQueryErrorState<TUrlParams, THeaders>
  | HttpQuerySuccessState<TResponseBody, TUrlParams, THeaders>;

function isHttpState<
  TResponseBody extends JsonTypes,
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
>(value: unknown): value is HttpState<TResponseBody, TUrlParams, THeaders> {
  const hasState = isObjectLike(value) && typeof value["state"] === "string";

  if (hasState && value["state"] === ERROR_STATE) {
    return (
      isHandledHttpError(value["error"]) || value["error"] instanceof Error
    );
  }

  if (hasState && value["state"] === SUCCESS_STATE) {
    return value["response"] instanceof HttpResponse;
  }

  return hasState && value["state"] === PENDING_STATE;
}

export function isHttpQueryPending(
  value: unknown,
): value is HttpQueryPendingState {
  return isHttpState(value) && value.state === PENDING_STATE;
}

export function isHttpQueryError<
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
>(value: unknown): value is HttpQueryErrorState<TUrlParams, THeaders> {
  return isHttpState(value) && value.state === ERROR_STATE;
}

export function isHttpQuerySuccess<
  TResponseBody extends JsonTypes,
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
>(
  value: unknown,
): value is HttpQuerySuccessState<TResponseBody, TUrlParams, THeaders> {
  return isHttpState(value) && value.state === SUCCESS_STATE;
}

export type HttpQuery<
  TResponseBody extends JsonTypes,
  TUrlParams extends UrlParams,
  THeaders extends RequestHeaders,
> =
  | HttpQueryPendingState
  | HttpQueryErrorState<TUrlParams, THeaders>
  | HttpQuerySuccessState<TResponseBody, TUrlParams, THeaders>;
