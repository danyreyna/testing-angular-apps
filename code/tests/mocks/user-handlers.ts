import { http, HttpResponse } from "msw";
import type { User } from "../../src/app/common/user";
import { getStringHash } from "./get-string-hash";
import type { Rfc9457ProblemDetail } from "./rfc-9457-problem-detail";

export const mockUserDbTable = new Map<
  string,
  Pick<User, "id" | "username" | "source"> & { passwordHash: string }
>();

export const handlers = [
  http.put<{ id: string }, Pick<User, "username" | "password" | "source">>(
    "https://api.example.com/user/:id",
    async ({ params, request }) => {
      const body = await request.json();

      const { username, password, source } = body;
      const { id } = params;

      if (!username) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A username is required",
            detail:
              "To create or update a user a full representation including the username must be provided",
          },
          { status },
        );
      }

      if (!password) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A password is required",
            detail:
              "To create or update a user a full representation including the password must be provided",
          },
          { status },
        );
      }

      if (!source) {
        const status = 400;
        return HttpResponse.json<Rfc9457ProblemDetail>(
          {
            status,
            title: "A source is required",
            detail:
              "To create or update a user a full representation including the source must be provided",
          },
          { status },
        );
      }

      const passwordHash = getStringHash(password);

      const existingUser = mockUserDbTable.get(id);
      if (existingUser === undefined) {
        mockUserDbTable.set(id, { id, username, passwordHash, source });

        return new HttpResponse(null, { status: 201 });
      }

      const doesUserAlreadyHaveRequestedUpdates =
        username === existingUser.username &&
        passwordHash === existingUser.passwordHash &&
        source === existingUser.source;
      if (doesUserAlreadyHaveRequestedUpdates) {
        return new HttpResponse(null, { status: 200 });
      }

      mockUserDbTable.set(id, { id, username, passwordHash, source });
      return new HttpResponse(null, { status: 200 });
    },
  ),
  http.delete<{ id: string }>("https://api.example.com/user", ({ request }) => {
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
        { status },
      );
    }

    const userIdsToDelete = Array.from(mockUserDbTable.entries())
      .filter(([, { source: currentSource }]) => currentSource === source)
      .map(([id]) => id);

    for (const id of userIdsToDelete) {
      mockUserDbTable.delete(id);
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
