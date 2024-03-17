import { HttpResponse } from "@angular/common/http";
import {
  type HandledObservableError,
  isHandledHttpError,
} from "../../error/handle-observable-error";
import type { JSONTypes } from "../../http/json-types";
import { isObjectLike } from "../../is-object-like";
import type {
  HttpResponseWithNonNullBody,
  RequestHeaders,
  UrlParams,
} from "./types";

export type HttpCommandVariables = {
  urlParams?: UrlParams;
  headers?: RequestHeaders;
  body?: JSONTypes;
};

const IDLE_STATE = "idle";
export type HttpCommandIdleState = { state: typeof IDLE_STATE };

const PENDING_STATE = "pending";
export type HttpCommandPendingState = { state: typeof PENDING_STATE };

const ERROR_STATE = "error";
export type HttpCommandErrorState<
  TVariables extends void | HttpCommandVariables = void,
> = {
  state: typeof ERROR_STATE;
  error: HandledObservableError;
  variables: TVariables;
};

const SUCCESS_STATE = "success";
export type HttpCommandSuccessState<
  TResponseBody extends JSONTypes,
  TVariables extends void | HttpCommandVariables = void,
> = {
  state: typeof SUCCESS_STATE;
  response: HttpResponseWithNonNullBody<TResponseBody>;
  variables: TVariables;
};

type HttpState<
  TResponseBody extends JSONTypes,
  TVariables extends void | HttpCommandVariables,
> =
  | HttpCommandIdleState
  | HttpCommandPendingState
  | HttpCommandErrorState<TVariables>
  | HttpCommandSuccessState<TResponseBody, TVariables>;

function isHttpCommandState<
  TResponseBody extends JSONTypes,
  TVariables extends void | HttpCommandVariables,
>(value: unknown): value is HttpState<TResponseBody, TVariables> {
  const hasState = isObjectLike(value) && typeof value["state"] === "string";

  if (hasState && value["state"] === ERROR_STATE) {
    return (
      isHandledHttpError(value["error"]) || value["error"] instanceof Error
    );
  }

  if (hasState && value["state"] === SUCCESS_STATE) {
    return value["response"] instanceof HttpResponse;
  }

  return (
    hasState &&
    (value["state"] === IDLE_STATE || value["state"] === PENDING_STATE)
  );
}

export function isHttpCommandPending(
  value: unknown,
): value is HttpCommandPendingState {
  return isHttpCommandState(value) && value.state === PENDING_STATE;
}

export function isHttpCommandError<
  TVariables extends void | HttpCommandVariables,
>(value: unknown): value is HttpCommandErrorState<TVariables> {
  return isHttpCommandState(value) && value.state === ERROR_STATE;
}

export function isHttpCommandSuccess<
  TResponseBody extends JSONTypes,
  TVariables extends void | HttpCommandVariables,
>(value: unknown): value is HttpCommandSuccessState<TResponseBody, TVariables> {
  return isHttpCommandState(value) && value.state === SUCCESS_STATE;
}

export type HttpCommand<
  TResponseBody extends JSONTypes,
  TVariables extends void | HttpCommandVariables = void,
> =
  | HttpCommandIdleState
  | HttpCommandPendingState
  | HttpCommandErrorState<TVariables>
  | HttpCommandSuccessState<TResponseBody, TVariables>;
