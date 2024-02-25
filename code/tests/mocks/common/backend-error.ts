import { HttpResponse } from "msw";

export type Rfc9457ProblemDetail = {
  type?: string;
  status?: number;
  title?: string;
  detail?: string;
  instance?: string;
};

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
