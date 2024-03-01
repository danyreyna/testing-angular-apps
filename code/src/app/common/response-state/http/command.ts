import type { JSONTypes } from "../../json-types";
import type {
  HttpErrorState,
  HttpIdleState,
  HttpPendingState,
  HttpSuccessState,
} from "./response-states";

export type HttpCommand<TResponseBody extends JSONTypes> =
  | HttpIdleState
  | HttpPendingState
  | HttpErrorState
  | HttpSuccessState<TResponseBody>;
