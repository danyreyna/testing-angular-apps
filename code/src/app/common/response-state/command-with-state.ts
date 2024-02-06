import type {
  ErrorResponse,
  IdleState,
  PendingState,
  SuccessResponse,
} from "./response-states";

export type CommandWithState<TData> =
  | IdleState
  | PendingState
  | ErrorResponse
  | SuccessResponse<TData>;
