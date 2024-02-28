import { delay, http, HttpResponse, type PathParams } from "msw";
import type { Rfc9457ProblemDetail } from "../../../src/app/common/rfc-9457-problem-detail";
import type { UserWithoutPassword } from "../../../src/app/common/user";
import type { UserFormValues } from "../../../src/app/unauthenticated-app.component";
import { CORS_HEADERS } from "../common/cors-headers";
import { getStringHash } from "../common/get-string-hash";
import { handleInternalServerError } from "../common/handle-internal-server-error";
import { validateRequiredProperties } from "../common/validate-required-properties";
import { findByUsername } from "../user/user-db";
import {
  AUTH_SESSION_COOKIE_NAME,
  buildAuthSessionCookie,
  createAuthSession,
  generateAuthSessionId,
  removeAuthSessionCookie,
} from "./auth-session";
import { deleteAuthSession } from "./auth-session-db";

export const handlers = [
  http.post<PathParams, UserFormValues>(
    "https://api.example.com/login",
    async ({ request }) => {
      await delay();

      const body = await request.json();

      const requiredPropertiesValidationResult = validateRequiredProperties(
        body,
        ["username", "password"],
        {
          status: 400,
          getProblemDetailError: (propertyName) => ({
            title: `A "${propertyName}" is required`,
            detail: `To login the "${propertyName}" must be provided`,
          }),
          headers: CORS_HEADERS,
        },
      );
      if (requiredPropertiesValidationResult !== null) {
        return requiredPropertiesValidationResult;
      }

      const { username, password } = body;

      const userResult = await findByUsername(username);
      if (userResult instanceof Error) {
        return handleInternalServerError(userResult, CORS_HEADERS);
      }

      if (
        userResult === undefined ||
        userResult.passwordHash !== getStringHash(password)
      ) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "Invalid username or password",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const token = generateAuthSessionId();
      const createResult = await createAuthSession(token, userResult.id);
      if (createResult instanceof Error) {
        return handleInternalServerError(createResult, CORS_HEADERS);
      }

      return HttpResponse.json<UserWithoutPassword>(
        {
          id: userResult.id,
          username: userResult.username,
          source: userResult.source,
        },
        {
          status: 200,
          headers: {
            ...CORS_HEADERS,
            "Set-Cookie": buildAuthSessionCookie(token),
          },
        },
      );
    },
  ),
  http.post("https://api.example.com/logout", async ({ cookies }) => {
    const authSessionId = cookies[AUTH_SESSION_COOKIE_NAME];
    if (authSessionId === undefined) {
      const status = 401;
      return HttpResponse.json<Rfc9457ProblemDetail>(
        {
          status,
          title: "Can't log out a session that doesn't exist",
        },
        {
          status,
          headers: CORS_HEADERS,
        },
      );
    }

    const deleteResult = await deleteAuthSession(authSessionId);
    if (deleteResult instanceof Error) {
      return handleInternalServerError(deleteResult, CORS_HEADERS);
    }

    return new HttpResponse(null, {
      status: 204,
      headers: {
        ...CORS_HEADERS,
        "Set-Cookie": removeAuthSessionCookie(),
      },
    });
  }),
];
