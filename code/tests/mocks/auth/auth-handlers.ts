import {
  type DefaultBodyType,
  delay,
  http,
  HttpResponse,
  type PathParams,
} from "msw";
import type { RegisterRequestValues } from "../../../src/app/common/auth/auth.service";
import type {
  RequiredPropertiesProblemDetail,
  Rfc9457ProblemDetail,
} from "../../../src/app/common/rfc-9457-problem-detail";
import type { UserWithoutPassword } from "../../../src/app/common/user";
import type { UserFormValues } from "../../../src/app/unauthenticated-app.component";
import { CORS_HEADERS } from "../common/cors-headers";
import { dbTransaction } from "../common/db-transaction";
import { getStringHash } from "../common/get-string-hash";
import { handleInternalServerError } from "../common/handle-internal-server-error";
import { mockDb } from "../common/mock-db";
import { validateRequiredProperties } from "../common/validate-required-properties";
import { findByUsername, getUser } from "../user/user-db";
import {
  AUTH_SESSION_COOKIE_NAME,
  buildAuthSessionCookie,
  generateAuthSessionId,
  getAuthSessionExpirations,
  removeAuthSessionCookie,
} from "./auth-session";
import { deleteAuthSession } from "./auth-session-db";

export const handlers = [
  http.post<
    { id: string },
    RegisterRequestValues,
    RequiredPropertiesProblemDetail | Rfc9457ProblemDetail | UserWithoutPassword
  >("https://api.example.com/register/:id", async ({ params, request }) => {
    await delay();

    const body = await request.json();

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

    const { id } = params;
    const { username, password, source } = body;
    const passwordHash = getStringHash(password);

    const token = generateAuthSessionId();
    const { rollingExpiration, absoluteExpiration } =
      getAuthSessionExpirations();

    const existingUser = await getUser(id);
    const isNewUser = existingUser === undefined;
    const newUser = {
      id,
      username,
      passwordHash,
      source,
    };

    const transactionResult = await dbTransaction(
      "rw",
      [mockDb.users, mockDb.authSessions],
      async () => {
        if (isNewUser) {
          mockDb.users.add(newUser);

          mockDb.authSessions.add({
            id: token,
            userId: id,
            rollingExpiration,
            absoluteExpiration,
          });
        }

        return null;
      },
    );
    if (transactionResult instanceof Error) {
      return handleInternalServerError(transactionResult, CORS_HEADERS);
    }

    if (!isNewUser) {
      return handleInternalServerError(
        new Error("Error registering user"),
        CORS_HEADERS,
      );
    }

    return HttpResponse.json<UserWithoutPassword>(
      {
        id: newUser.id,
        username: newUser.username,
        source: newUser.source,
      },
      {
        status: 201,
        headers: {
          ...CORS_HEADERS,
          "Set-Cookie": buildAuthSessionCookie(token),
          Location: `https://api.example.com/user/${id}`,
          "Content-Location": `https://api.example.com/user/${id}`,
        },
      },
    );
  }),
  http.post<
    PathParams,
    UserFormValues,
    RequiredPropertiesProblemDetail | Rfc9457ProblemDetail | UserWithoutPassword
  >("https://api.example.com/login", async ({ request }) => {
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

    try {
      return await mockDb.transaction(
        "rw",
        [mockDb.users, mockDb.authSessions],
        async () => {
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
                "Content-Location": `https://api.example.com/user/${userResult.id}`,
              },
            },
          );
        },
      );
    } catch (error) {
      return handleInternalServerError(
        error instanceof Error
          ? error
          : new Error(`Error in Dexie transaction: ${JSON.stringify(error)}`),
        CORS_HEADERS,
      );
    }
  }),
  http.post<PathParams, DefaultBodyType, Rfc9457ProblemDetail | undefined>(
    "https://api.example.com/logout",
    async ({ cookies }) => {
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

      return HttpResponse.json(undefined, {
        status: 204,
        headers: {
          ...CORS_HEADERS,
          "Set-Cookie": removeAuthSessionCookie(),
        },
      });
    },
  ),
];
