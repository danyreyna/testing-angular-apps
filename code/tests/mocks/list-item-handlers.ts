import { DefaultBodyType, http, HttpResponse, type PathParams } from "msw";
import type { Rfc9457ProblemDetail } from "../../src/app/common/http/rfc-9457-problem-detail";
import type {
  ListItem,
  ListItemsResponseBody,
  UpdateListItemRequestBody,
} from "../../src/app/list-item/list-items.service";
import { AUTH_SESSION_COOKIE_NAME } from "./auth/auth-session";
import { getAuthSession } from "./auth/auth-session-db";
import { mockBookDbTable } from "./book-handlers";
import { CORS_HEADERS } from "./common/cors-headers";
import { handleInternalServerError } from "./common/handle-internal-server-error";
import { getUser } from "./user/user-db";

export const mockListItemDbTable = new Map<string, ListItem>();

export function getListItemsByOwner(userId: string) {
  return Array.from(mockListItemDbTable.values()).filter(
    ({ ownerId }) => ownerId === userId,
  );
}

export const handlers = [
  http.get<
    PathParams,
    DefaultBodyType,
    Rfc9457ProblemDetail | ListItemsResponseBody
  >("https://api.example.com/list-items", async ({ cookies }) => {
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
          detail: "Can't find a user with the provided token",
        },
        {
          status,
          headers: CORS_HEADERS,
        },
      );
    }

    const listItems = getListItemsByOwner(userResult.id);
    const listItemsAndBooks = listItems.map((listItem) => ({
      ...listItem,
      book: mockBookDbTable.get(listItem.bookId) ?? null,
    }));

    return HttpResponse.json<ListItemsResponseBody>(
      {
        listItems: listItemsAndBooks,
      },
      {
        headers: CORS_HEADERS,
      },
    );
  }),
  http.put<
    { listItemId: string },
    UpdateListItemRequestBody,
    Rfc9457ProblemDetail | undefined
  >(
    "https://api.example.com/list-items/:listItemId",
    async ({ cookies, params: { listItemId }, request }) => {
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

      const { userId } = authSessionResult;

      const listItem = mockListItemDbTable.get(listItemId);
      if (listItem === undefined) {
        const status = 404;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "List item not found",
            detail: `No list item was found with the ID "${listItemId}"`,
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      if (listItem.ownerId !== userId) {
        const status = 403;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "User is not authorized to view that list",
            detail: `The user with ID "${userId}" does not own the list item with ID "${listItemId}"`,
          },
          {
            status,
            headers: CORS_HEADERS,
          },
        );
      }

      const body = await request.json();
      mockListItemDbTable.set(listItemId, {
        ...listItem,
        ...body,
      });

      return HttpResponse.json(undefined, {
        status: 204,
        headers: CORS_HEADERS,
      });
    },
  ),
];
