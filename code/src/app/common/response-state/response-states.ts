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
  const isObject = typeof value === "object" && value !== null;
  const hasState =
    isObject && "state" in value && typeof value.state === "string";

  if (hasState && value.state === ERROR_STATE) {
    return "message" in value && typeof value.message === "string";
  }

  if (hasState && value.state === SUCCESS_STATE) {
    return "data" in value;
  }

  return (
    hasState && (value.state === IDLE_STATE || value.state === PENDING_STATE)
  );
}

export function isPending(value: unknown): value is PendingState {
  return isResponse(value) && value.state === PENDING_STATE;
}

export function isErrorResponse(value: unknown): value is ErrorResponse {
  return isResponse(value) && value.state === ERROR_STATE;
}

export function isSuccessResponse<TData>(
  value: unknown,
): value is SuccessResponse<TData> {
  return isResponse(value) && value.state === SUCCESS_STATE;
}
