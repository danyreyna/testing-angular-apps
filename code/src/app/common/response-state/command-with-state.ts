import type { JSONTypes } from "../json-types";
import type {
  ErrorResponse,
  IdleState,
  PendingState,
  SuccessResponse,
} from "./response-states";

export type CommandWithState<TData extends JSONTypes> =
  | IdleState
  | PendingState
  | ErrorResponse
  | SuccessResponse<TData>;
