import type {
  ErrorResponse,
  PendingState,
  SuccessResponse,
} from "./response-states";

export type QueryWithState<TData> =
  | PendingState
  | ErrorResponse
  | SuccessResponse<TData>;
