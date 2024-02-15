import type { JSONTypes } from "../json-types";
import type {
  ErrorResponse,
  PendingState,
  SuccessResponse,
} from "./response-states";

export type QueryWithState<TData extends JSONTypes> =
  | PendingState
  | ErrorResponse
  | SuccessResponse<TData>;
