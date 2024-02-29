import { isObjectLike } from "../is-object-like";

const IDLE_STATE = "idle";
export type IdleState = { state: typeof IDLE_STATE };

const PENDING_STATE = "pending";
export type PendingState = { state: typeof PENDING_STATE };

const ERROR_STATE = "error";
export type HttpErrorResponse = {
  state: typeof ERROR_STATE;
  message: string;
  status: number;
};
export type ErrorResponse =
  | {
      state: typeof ERROR_STATE;
      message: string;
    }
  | HttpErrorResponse;

const SUCCESS_STATE = "success";
export type SuccessResponse<TData> = {
  state: typeof SUCCESS_STATE;
  data: TData;
};

type Response<TData> =
  | IdleState
  | PendingState
  | ErrorResponse
  | SuccessResponse<TData>;

function isResponse<TData>(value: unknown): value is Response<TData> {
  const hasState = isObjectLike(value) && typeof value["state"] === "string";

  if (hasState && value["state"] === ERROR_STATE) {
    return typeof value["message"] === "string";
  }

  if (hasState && value["state"] === SUCCESS_STATE) {
    return value["data"] !== undefined;
  }

  return (
    hasState &&
    (value["state"] === IDLE_STATE || value["state"] === PENDING_STATE)
  );
}

export function isPending(value: unknown): value is PendingState {
  return isResponse(value) && value.state === PENDING_STATE;
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return isResponse(value) && value.state === ERROR_STATE;
}

export function isHttpErrorResponse(
  value: unknown,
): value is HttpErrorResponse {
  if (!isObjectLike(value)) {
    return false;
  }

  return (
    value["state"] === ERROR_STATE &&
    typeof value["message"] === "string" &&
    typeof value["status"] === "number"
  );
}

export function isSuccessResponse<TData>(
  value: unknown,
): value is SuccessResponse<TData> {
  return isResponse(value) && value.state === SUCCESS_STATE;
}
