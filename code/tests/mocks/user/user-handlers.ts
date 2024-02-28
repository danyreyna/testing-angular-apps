import { DefaultBodyType, http, HttpResponse, PathParams } from "msw";
import type { Rfc9457ProblemDetail } from "../../../src/app/common/rfc-9457-problem-detail";
import { AUTH_SESSION_COOKIE_NAME } from "../auth/auth-session";
import { CORS_HEADERS } from "../common/cors-headers";
import { handleInternalServerError } from "../common/handle-internal-server-error";
import type { DbUser } from "../common/mock-db";
import { deleteUsersWithSource, getUser } from "./user-db";

export const handlers = [
  http.get<{ id: string }, DefaultBodyType, Rfc9457ProblemDetail | DbUser>(
    "https://api.example.com/user/:id",
    async ({ cookies, params }) => {
      const authSessionId = cookies[AUTH_SESSION_COOKIE_NAME];
      if (authSessionId === undefined) {
        const status = 401;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A token must be provided",
            detail: "Can't get user information without a token",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const { id } = params;
      const existingUser = await getUser(id);
      if (existingUser instanceof Error) {
        return handleInternalServerError(existingUser, CORS_HEADERS);
      }

      if (existingUser === undefined) {
        const status = 404;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "User not found",
            detail: `Can't find a user with the ID "${id}"`,
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      return HttpResponse.json<DbUser>(existingUser, { headers: CORS_HEADERS });
    },
  ),
  http.delete<PathParams, DefaultBodyType, Rfc9457ProblemDetail | undefined>(
    "https://api.example.com/user",
    async ({ cookies, request }) => {
      const authSessionId = cookies[AUTH_SESSION_COOKIE_NAME];
      if (authSessionId === undefined) {
        const status = 401;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A token must be provided",
            detail: "Can't delete users without a token",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const url = new URL(request.url);
      const source = url.searchParams.get("source");

      if (source !== "test") {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: `The source must be "test"`,
            detail:
              "At the moment we can only delete multiple users if they were generated in tests",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const deleteResult = await deleteUsersWithSource(source);
      if (deleteResult instanceof Error) {
        return handleInternalServerError(deleteResult, CORS_HEADERS);
      }

      return HttpResponse.json(undefined, {
        status: 204,
        headers: CORS_HEADERS,
      });
    },
  ),
];
