import { delay, http, HttpResponse } from "msw";
import type { RegisterRequestValues } from "../../../src/app/common/auth/auth.service";
import type { Rfc9457ProblemDetail } from "../../../src/app/common/rfc-9457-problem-detail";
import {
  AUTH_SESSION_COOKIE_NAME,
  buildAuthSessionCookie,
  createAuthSession,
  generateAuthSessionId,
} from "../auth/auth-session";
import { CORS_HEADERS } from "../common/cors-headers";
import { getStringHash } from "../common/get-string-hash";
import { handleInternalServerError } from "../common/handle-internal-server-error";
import { validateRequiredProperties } from "../common/validate-required-properties";
import { addUser, deleteUsersWithSource, getUser } from "./user-db";

export const handlers = [
  http.put<{ id: string }, RegisterRequestValues>(
    "https://api.example.com/user/:id",
    async ({ params, request }) => {
      await delay();

      const body = await request.json();

      const { username, password, source } = body;
      const { id } = params;

      const requiredPropertiesValidationResult = validateRequiredProperties(
        body,
        ["username", "password", "source"],
        {
          status: 400,
          getProblemDetailError: (propertyName) => ({
            title: `A "${propertyName}" is required`,
            detail: `To create or update a user a full representation including the "${propertyName}" must be provided`,
          }),
          headers: CORS_HEADERS,
        },
      );
      if (requiredPropertiesValidationResult !== null) {
        return requiredPropertiesValidationResult;
      }

      const existingUser = await getUser(id);
      if (existingUser instanceof Error) {
        return handleInternalServerError(existingUser, CORS_HEADERS);
      }

      const passwordHash = getStringHash(password);

      if (existingUser === undefined) {
        const addUserResult = await addUser({
          id,
          username,
          passwordHash,
          source,
        });
        if (addUserResult instanceof Error) {
          return handleInternalServerError(addUserResult, CORS_HEADERS);
        }

        const token = generateAuthSessionId();
        const createAuthSessionResult = await createAuthSession(token, id);
        if (createAuthSessionResult instanceof Error) {
          return handleInternalServerError(
            createAuthSessionResult,
            CORS_HEADERS,
          );
        }

        return new HttpResponse(null, {
          status: 201,
          headers: {
            ...CORS_HEADERS,
            "Set-Cookie": buildAuthSessionCookie(token),
          },
        });
      }

      const doesUserAlreadyHaveRequestedUpdates =
        username === existingUser.username &&
        passwordHash === existingUser.passwordHash &&
        source === existingUser.source;
      if (doesUserAlreadyHaveRequestedUpdates) {
        return new HttpResponse(null, {
          status: 200,
          headers: CORS_HEADERS,
        });
      }

      const addUserResult = await addUser({
        id,
        username,
        passwordHash,
        source,
      });
      if (addUserResult instanceof Error) {
        return handleInternalServerError(addUserResult, CORS_HEADERS);
      }

      return new HttpResponse(null, {
        status: 200,
        headers: CORS_HEADERS,
      });
    },
  ),
  http.delete<{ id: string }>(
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

      return new HttpResponse(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    },
  ),
];
