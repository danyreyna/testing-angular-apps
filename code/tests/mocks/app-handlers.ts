import { delay, http, HttpResponse, type PathParams } from "msw";
import type { BootstrapResponse } from "../../src/app/common/bootstrap.service";
import { type Rfc9457ProblemDetail } from "../../src/app/common/rfc-9457-problem-detail";
import type { UserWithoutPassword } from "../../src/app/common/user";
import { AUTH_SESSION_COOKIE_NAME } from "./auth/auth-session";
import { getAuthSession } from "./auth/auth-session-db";
import { mockBookDbTable } from "./book-handlers";
import { CORS_HEADERS } from "./common/cors-headers";
import { handleInternalServerError } from "./common/handle-internal-server-error";
import { getListItemsByOwner } from "./list-item-handlers";
import { getUser } from "./user/user-db";

export const handlers = [
  // endpoint to get the user's information and preload data in the in-memory cache
  http.get<PathParams>(
    "https://api.example.com/bootstrap",
    async ({ cookies }) => {
      await delay();

      const authSessionId = cookies[AUTH_SESSION_COOKIE_NAME];
      if (authSessionId === undefined) {
        const status = 401;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A token must be provided",
            detail: "Can't bootstrap the application without a token",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const authSessionResult = await getAuthSession(authSessionId);
      if (authSessionResult instanceof Error) {
        return handleInternalServerError(authSessionResult, CORS_HEADERS);
      }

      if (authSessionResult === undefined) {
        const status = 401;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "Invalid token. Please login again.",
            detail: "Can't bootstrap the application without a valid token",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const userResult = await getUser(authSessionResult.userId);
      if (userResult instanceof Error) {
        return handleInternalServerError(userResult, CORS_HEADERS);
      }

      if (userResult === undefined) {
        const status = 404;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "User not found",
            detail: "Can't find an user with the provided token",
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const { id, username, source } = userResult;

      const userWithoutPassword: UserWithoutPassword = {
        id,
        username,
        source,
      };

      const listItems = getListItemsByOwner(userWithoutPassword.id);
      const listItemsAndBooks = listItems.map((listItem) => ({
        ...listItem,
        book: mockBookDbTable.get(listItem.bookId) ?? null,
      }));

      return HttpResponse.json<BootstrapResponse>(
        {
          user: userWithoutPassword,
          listItems: listItemsAndBooks,
        },
        {
          headers: CORS_HEADERS,
        },
      );
    },
  ),
];
