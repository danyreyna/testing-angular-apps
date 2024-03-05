import type {
  ErrorResponse,
  IdleState,
  PendingState,
  SuccessResponse,
} from "./state";

export type CommandWithState<TData> =
  | IdleState
  | PendingState
  | ErrorResponse
  | SuccessResponse<TData>;
