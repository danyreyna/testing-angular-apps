import type { JSONTypes } from "../../json-types";
import type {
  HttpErrorState,
  HttpPendingState,
  HttpSuccessState,
} from "./response-states";

export type HttpQuery<TResponseBody extends JSONTypes> =
  | HttpPendingState
  | HttpErrorState
  | HttpSuccessState<TResponseBody>;
