import { HttpResponse } from "msw";
import type { Rfc9457ProblemDetail } from "../../../src/app/common/error/rfc-9457-problem-detail";

export function handleInternalServerError(error: Error, headers?: HeadersInit) {
  const status = 500;

  const { cause: errorCause } = error;

  return HttpResponse.json<Rfc9457ProblemDetail>(
    {
      status,
      title: error.message,
      ...(errorCause instanceof Error ? { detail: errorCause.message } : {}),
    },
    {
      status,
      headers,
    },
  );
}
