import type { PathParams } from "msw";
import { http, HttpResponse } from "msw";
import { mockSessionDbTable, type UserWithoutPassword } from "./auth-handlers";
import { mockBookDbTable } from "./book-handlers";
import { getListItemsByOwner } from "./list-item-handlers";
import type { Rfc9457ProblemDetail } from "./rfc-9457-problem-detail";
import { mockUserDbTable } from "./user-handlers";

export const handlers = [
  // endpoint to get the user's information and preload data in the in-memory cache
  http.get<PathParams>("https://api.example.com/bootstrap", ({ cookies }) => {
    const sessionId = cookies["__Host-id"];
    if (sessionId === undefined) {
      const status = 401;
      return HttpResponse.json<Rfc9457ProblemDetail>(
        {
          status,
          title: "A token must be provided",
          detail: "Can't bootstrap the application without a token",
        },
        { status },
      );
    }

    const session = mockSessionDbTable.get(sessionId);
    if (session === undefined) {
      const status = 401;
      return HttpResponse.json<Rfc9457ProblemDetail>(
        {
          status,
          title: "Invalid token. Please login again.",
          detail: "Can't bootstrap the application without a valid token",
        },
        { status },
      );
    }

    const user = mockUserDbTable.get(session.userId);
    if (user === undefined) {
      const status = 404;
      return HttpResponse.json<Rfc9457ProblemDetail>(
        {
          status,
          title: "User not found.",
          detail: "Can't find an user with the provided token",
        },
        { status },
      );
    }

    const { id, username, source } = user;

    const userWithoutPassword: UserWithoutPassword = {
      id,
      username,
      source,
    };

    const listItems = getListItemsByOwner(userWithoutPassword.id);
    const listItemsAndBooks = listItems.map((listItem) => ({
      ...listItem,
      book: mockBookDbTable.get(listItem.bookId),
    }));

    return HttpResponse.json({
      user: userWithoutPassword,
      listItems: listItemsAndBooks,
    });
  }),
];
