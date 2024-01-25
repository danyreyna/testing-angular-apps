export type SuccessResponse<TData> = { status: "success"; data: TData };

export type ErrorResponse = { status: "error"; message: string };

export type ResponseWithStatus<TData> =
  | { status: "idle" }
  | {
      status: "pending";
    }
  | ErrorResponse
  | SuccessResponse<TData>;

export function isSuccessResponse<TData>(
  value: ResponseWithStatus<TData>,
): value is SuccessResponse<TData> {
  return value.status === "success";
}

export function isErrorResponse<TData>(
  value: ResponseWithStatus<TData>,
): value is ErrorResponse {
  return value.status === "error";
}
