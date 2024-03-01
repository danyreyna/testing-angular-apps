import type { ErrorResponse, PendingState, SuccessResponse } from "./state";

export type QueryWithState<TData> =
  | PendingState
  | ErrorResponse
  | SuccessResponse<TData>;
